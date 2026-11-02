import { randomUUID, timingSafeEqual } from "node:crypto";
import {
  ApiError,
  openaiCall,
  type AiConfig,
  type ModelCall,
} from "../service";
import {
  discover,
  identityVerifier,
  opaque,
  pkceChallenge,
  planEnabled,
  parseGrant,
  SCOPES,
  RESOURCE,
  type Discovery,
  type Identity,
} from "./protocol";
import type { CredentialVault, VaultData, Connection } from "./vault";
import { chatgptCall } from "./transport";

interface Options {
  port: number;
  vault: CredentialVault;
  api: AiConfig;
  fetcher?: typeof fetch;
  clock?: () => number;
  verify?: (
    token: string,
    clientId: string,
    nonce?: string,
  ) => Promise<Identity>;
}
interface Pending {
  verifier: string;
  nonce: string;
  cookie: string;
  clientId: string;
  selectedId?: string;
  returnTo: string;
  redirectUri: string;
  expires: number;
}
interface Model {
  slug: string;
  name: string;
}
const equal = (a: string, b: string) => {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.byteLength === y.byteLength && timingSafeEqual(x, y);
};
const object = (data: unknown): Record<string, unknown> => {
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new ApiError(400, "invalid_request");
  return data as Record<string, unknown>;
};
export function createChatgptManager(options: Options) {
  const fetcher = options.fetcher ?? fetch,
    clock = options.clock ?? Date.now,
    vault = options.vault;
  const base = `http://127.0.0.1:${options.port}`,
    redirectUri = `${base}/auth/callback`;
  const origins = new Set([
    `http://localhost:${options.port}`,
    base,
    "http://localhost:5174",
    "http://127.0.0.1:5174",
  ]);
  const tickets = new Map<
      string,
      { selectedId?: string; returnTo: string; expires: number }
    >(),
    pending = new Map<string, Pending>();
  const catalog = new Map<string, { models: Model[]; expires: number }>();
  const flights = new Map<string, AbortController>();
  const stopFlights = (id: string | null | undefined) => {
    if (id) {
      flights.get(id)?.abort();
      flights.delete(id);
    }
  };
  let discovery: Discovery | undefined,
    verify = options.verify,
    queue = Promise.resolve();
  const mutate = <T>(fn: () => Promise<T>): Promise<T> => {
    const result = queue.then(fn);
    queue = result.then(
      () => {},
      () => {},
    );
    return result;
  };
  const metadata = async () => {
    if (!discovery) {
      discovery = await discover(fetcher);
      verify ??= identityVerifier(discovery);
    }
    return discovery;
  };
  const purge = () => {
    for (const [key, value] of tickets)
      if (value.expires <= clock()) tickets.delete(key);
    for (const [key, value] of pending)
      if (value.expires <= clock()) pending.delete(key);
  };
  const active = (data: VaultData) =>
    data.accounts.find((a) => a.id === data.activeId);
  const tokenRequest = async (body: URLSearchParams) => {
    const meta = await metadata();
    let response: Response;
    try {
      response = await fetcher(meta.token_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(20000),
      });
    } catch {
      throw new ApiError(503, "chatgpt_connection_unavailable");
    }
    if (!response.ok)
      throw new ApiError(
        response.status === 400 || response.status === 401 ? 401 : 503,
        response.status === 400 || response.status === 401
          ? "chatgpt_sign_in_required"
          : "chatgpt_connection_unavailable",
      );
    try {
      return await response.json();
    } catch {
      throw new ApiError(502, "chatgpt_token_exchange_failed");
    }
  };
  const tokens = () =>
    mutate(async () => {
      const data = await vault.read(),
        account = active(data);
      if (!account?.grant || account.needsLogin)
        throw new ApiError(401, "chatgpt_sign_in_required");
      if (!planEnabled(account.grant.scopes))
        throw new ApiError(403, "chatgpt_plan_unavailable");
      if (account.grant.expiresAt - clock() < 60000) {
        if (!account.grant.refreshToken)
          throw new ApiError(401, "chatgpt_sign_in_required");
        try {
          const raw = await tokenRequest(
            new URLSearchParams({
              grant_type: "refresh_token",
              client_id: account.clientId,
              refresh_token: account.grant.refreshToken,
              resource: RESOURCE,
            }),
          );
          const grant = parseGrant(raw, clock(), account.grant);
          if (grant.idToken !== account.grant.idToken) {
            const identity = await verify!(grant.idToken, account.clientId);
            if (identity.subject !== account.identity.subject)
              throw new ApiError(401, "chatgpt_invalid_identity");
          }
          account.grant = grant;
          await vault.write(data);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            account.needsLogin = true;
            account.grant = null;
            await vault.write(data);
          }
          throw error;
        }
      }
      if (!planEnabled(account.grant.scopes))
        throw new ApiError(403, "chatgpt_plan_unavailable");
      return { id: account.id, accessToken: account.grant.accessToken };
    });
  const models = async (force = false) => {
    const auth = await tokens(),
      cached = catalog.get(auth.id);
    if (!force && cached && cached.expires > clock())
      return { accountId: auth.id, models: cached.models };
    let response: Response;
    try {
      response = await fetcher(`${RESOURCE}/models`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new ApiError(503, "chatgpt_models_unavailable");
    }
    if (!response.ok)
      throw new ApiError(
        response.status === 401 ? 401 : 503,
        response.status === 401
          ? "chatgpt_sign_in_required"
          : "chatgpt_models_unavailable",
      );
    const body = (await response.json()) as {
      models?: {
        slug?: unknown;
        display_name?: unknown;
        visibility?: unknown;
      }[];
    };
    if (!Array.isArray(body.models))
      throw new ApiError(502, "chatgpt_models_unavailable");
    const list = body.models
      .filter(
        (m) =>
          m.visibility === "list" &&
          typeof m.slug === "string" &&
          /^[A-Za-z0-9_.:/-]{1,150}$/.test(m.slug) &&
          typeof m.display_name === "string",
      )
      .map((m) => ({ slug: m.slug as string, name: m.display_name as string }));
    if (!list.length) throw new ApiError(403, "chatgpt_plan_unavailable");
    catalog.set(auth.id, { models: list, expires: clock() + 300000 });
    return { accountId: auth.id, models: list };
  };
  const credentials = async () => {
    const selection = await models(),
      auth = await tokens(),
      data = await vault.read(),
      account = active(data),
      list = selection.models;
    if (!account || account.id !== auth.id || selection.accountId !== auth.id)
      throw new ApiError(409, "chatgpt_account_changed");
    let flight = flights.get(auth.id);
    if (!flight) {
      flight = new AbortController();
      flights.set(auth.id, flight);
    }
    return {
      accessToken: auth.accessToken,
      signal: flight.signal,
      model: list.some((m) => m.slug === account.model)
        ? account.model
        : list[0].slug,
    };
  };
  const streaming = chatgptCall(credentials, fetcher);
  const call: ModelCall = async (request) => {
    const data = await vault.read();
    if (data.provider === "api-key")
      return openaiCall(options.api, fetcher)(request);
    return streaming(request);
  };
  const status = async (force = false): Promise<Record<string, unknown>> => {
    const data = await vault.read(),
      account = active(data);
    let list: Model[] = [],
      notice = "";
    if (
      data.provider === "chatgpt" &&
      account?.grant &&
      !account.needsLogin &&
      planEnabled(account.grant.scopes)
    ) {
      try {
        const selection = await models(force);
        if (selection.accountId !== account.id)
          throw new ApiError(409, "chatgpt_account_changed");
        list = selection.models;
      } catch (error) {
        notice =
          error instanceof ApiError ? error.code : "chatgpt_models_unavailable";
      }
    }
    const latest = await vault.read(),
      selected = active(latest);
    if (selected?.id !== account?.id) {
      list = [];
      notice = "chatgpt_account_changed";
    }
    const allowed =
      !!selected?.grant &&
      !selected.needsLogin &&
      planEnabled(selected.grant.scopes);
    const model =
      latest.provider === "api-key"
        ? options.api.model
        : (list.find((m) => m.slug === selected?.model)?.slug ??
          list[0]?.slug ??
          "");
    return {
      ready:
        latest.provider === "api-key"
          ? !!options.api.key.trim()
          : allowed && !!model,
      provider: latest.provider === "api-key" ? "OpenAI API" : "ChatGPT",
      authMode: latest.provider,
      keyConfigured: !!options.api.key.trim(),
      model,
      chatgpt: {
        activeId: latest.activeId,
        connected: !!selected?.grant,
        planEnabled: allowed,
        models: list,
        notice,
        accounts: latest.accounts.map((a) => ({
          id: a.id,
          name: a.identity.name,
          email: a.identity.email,
          connected: !!a.grant,
          planEnabled: !!a.grant && planEnabled(a.grant.scopes),
          needsLogin: a.needsLogin,
        })),
      },
    };
  };
  const handle = async (
    method: string,
    path: string,
    body: unknown,
  ): Promise<Record<string, unknown>> => {
    purge();
    if (method === "GET" && path === "/api/ai/chatgpt/models")
      return status(true);
    if (method !== "POST") throw new ApiError(405, "method_not_allowed");
    const input = object(body);
    if (path === "/api/ai/chatgpt/start") {
      if (tickets.size >= 10 || pending.size >= 10)
        throw new ApiError(429, "local_limit");
      const data = await vault.read();
      let selectedId: string | undefined;
      if (input.accountId !== undefined) {
        if (
          typeof input.accountId !== "string" ||
          !data.accounts.some((a) => a.id === input.accountId)
        )
          throw new ApiError(400, "invalid_request");
        selectedId = input.accountId;
      }
      let returnTo = `${base}/world`;
      if (typeof input.returnTo === "string") {
        let url: URL;
        try {
          url = new URL(input.returnTo);
        } catch {
          throw new ApiError(400, "invalid_request");
        }
        if (
          !origins.has(url.origin) ||
          !["/world", "/login", "/island/mathematics"].includes(url.pathname)
        )
          throw new ApiError(400, "invalid_request");
        returnTo = url.origin + url.pathname;
      }
      const ticket = opaque();
      tickets.set(ticket, { selectedId, returnTo, expires: clock() + 120000 });
      return { url: `${base}/auth/chatgpt/start?ticket=${ticket}` };
    }
    if (path === "/api/ai/chatgpt/provider")
      return mutate(async () => {
        if (input.provider !== "chatgpt" && input.provider !== "api-key")
          throw new ApiError(400, "invalid_request");
        if (input.provider === "api-key" && !options.api.key.trim())
          throw new ApiError(503, "ai_not_configured");
        const data = await vault.read();
        if (data.provider !== input.provider) stopFlights(data.activeId);
        data.provider = input.provider;
        await vault.write(data);
        return { ok: true };
      });
    if (path === "/api/ai/chatgpt/select")
      return mutate(async () => {
        const data = await vault.read();
        if (
          typeof input.accountId !== "string" ||
          !data.accounts.some((a) => a.id === input.accountId)
        )
          throw new ApiError(400, "invalid_request");
        if (data.activeId !== input.accountId) stopFlights(data.activeId);
        data.activeId = input.accountId;
        data.provider = "chatgpt";
        await vault.write(data);
        return { ok: true };
      });
    if (path === "/api/ai/chatgpt/model") {
      const selection = await models();
      return mutate(async () => {
        const data = await vault.read(),
          account = active(data);
        if (
          !account ||
          account.id !== selection.accountId ||
          !selection.models.some((m) => m.slug === input.model)
        )
          throw new ApiError(400, "invalid_request");
        account.model = input.model as string;
        await vault.write(data);
        return { ok: true };
      });
    }
    if (path === "/api/ai/chatgpt/disconnect")
      return mutate(async () => {
        const data = await vault.read(),
          account = data.accounts.find(
            (a) => a.id === (input.accountId ?? data.activeId),
          );
        if (!account) throw new ApiError(400, "invalid_request");
        stopFlights(account.id);
        let revoked = !account.grant?.refreshToken;
        if (account.grant?.refreshToken) {
          try {
            const meta = await metadata();
            if (meta.revocation_endpoint) {
              for (let i = 0; i < 2; i++) {
                try {
                  const response = await fetcher(meta.revocation_endpoint, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                      token: account.grant.refreshToken,
                      token_type_hint: "refresh_token",
                      client_id: account.clientId,
                    }),
                    signal: AbortSignal.timeout(10000),
                  });
                  if (response.status === 200) {
                    revoked = true;
                    break;
                  }
                  if (response.status < 500) break;
                } catch {
                  revoked = false;
                }
                if (i === 0)
                  await new Promise((resolve) => setTimeout(resolve, 250));
              }
            }
          } catch {
            revoked = false;
          }
        }
        account.grant = null;
        account.needsLogin = true;
        catalog.delete(account.id);
        if (data.activeId === account.id) data.activeId = null;
        await vault.write(data);
        return { ok: true, revoked };
      });
    throw new ApiError(404, "not_found");
  };
  const begin = async (ticket: string) => {
    purge();
    const kickoff = tickets.get(ticket);
    if (!kickoff) throw new ApiError(400, "chatgpt_sign_in_expired");
    tickets.delete(ticket);
    const meta = await metadata(),
      data = await vault.read(),
      selected = data.accounts.find((a) => a.id === kickoff.selectedId);
    const state = opaque(),
      nonce = opaque(),
      verifier = opaque(),
      cookie = opaque(),
      clientId = selected?.clientId ?? "dynamic_agent_client";
    pending.set(state, {
      ...kickoff,
      verifier,
      nonce,
      cookie,
      clientId,
      redirectUri,
      expires: clock() + 600000,
    });
    const params = new URLSearchParams({
      client_id: clientId,
      ext_agent_host_id: data.hostId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: SCOPES,
      resource: RESOURCE,
      state,
      nonce,
      code_challenge_method: "S256",
      code_challenge: pkceChallenge(verifier),
    });
    if (clientId === "dynamic_agent_client")
      params.set("agent_name_hint", "Qwizo");
    else if (selected?.grant?.idToken)
      params.set("id_token_hint", selected.grant.idToken);
    return {
      location: `${meta.authorization_endpoint}?${params}`,
      cookie: `qwizo_oauth=${cookie}; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=600`,
    };
  };
  const callback = async (query: URLSearchParams, cookieHeader: string) => {
    for (const key of ["state", "code", "client_id", "error"])
      if (query.getAll(key).length > 1)
        throw new ApiError(400, "chatgpt_invalid_callback");
    purge();
    const state = query.get("state") ?? "",
      attempt = pending.get(state),
      cookie =
        cookieHeader
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("qwizo_oauth="))
          ?.slice("qwizo_oauth=".length) ?? "";
    if (!attempt || !equal(attempt.cookie, cookie))
      throw new ApiError(400, "chatgpt_invalid_callback");
    pending.delete(state);
    const redirect = (outcome: string) => ({
      location: `${attempt.returnTo}?chatgpt=${outcome}`,
      cookie: "qwizo_oauth=; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=0",
    });
    if (query.has("error")) return redirect("denied");
    const code = query.get("code"),
      issued =
        query.get("client_id") ??
        (attempt.clientId !== "dynamic_agent_client" ? attempt.clientId : null);
    if (
      !code ||
      code.length > 8192 ||
      !issued ||
      !/^oaiapp_[A-Za-z0-9_-]{1,200}$/.test(issued) ||
      (attempt.clientId !== "dynamic_agent_client" &&
        issued !== attempt.clientId)
    )
      throw new ApiError(400, "chatgpt_invalid_callback");
    const raw = await tokenRequest(
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: issued,
        code,
        code_verifier: attempt.verifier,
        redirect_uri: attempt.redirectUri,
        resource: RESOURCE,
      }),
    );
    const grant = parseGrant(raw, clock());
    const identity = await verify!(grant.idToken, issued, attempt.nonce);
    await mutate(async () => {
      const data = await vault.read(),
        selected = data.accounts.find((a) => a.id === attempt.selectedId);
      if (
        selected &&
        (selected.clientId !== issued ||
          selected.identity.subject !== identity.subject)
      )
        throw new ApiError(401, "chatgpt_invalid_identity");
      const existing =
        selected ??
        data.accounts.find(
          (a) =>
            a.clientId === issued && a.identity.subject === identity.subject,
        );
      const connection: Connection = {
        id: existing?.id ?? randomUUID(),
        clientId: issued,
        identity,
        grant,
        nonce: attempt.nonce,
        model: existing?.model ?? "",
        needsLogin: false,
      };
      if (!existing && data.accounts.length >= 10)
        throw new ApiError(429, "local_limit");
      stopFlights(data.activeId);
      data.accounts = data.accounts.filter((a) => a.id !== connection.id);
      data.accounts.push(connection);
      data.activeId = connection.id;
      data.provider = "chatgpt";
      catalog.delete(connection.id);
      await vault.write(data);
    });
    return redirect(
      planEnabled(grant.scopes) ? "connected" : "permission_needed",
    );
  };
  return { status, handle, begin, callback, call };
}
