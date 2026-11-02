import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { generateKeyPair, SignJWT, exportJWK, createLocalJWKSet } from "jose";
import { ApiError, type ModelRequest } from "../server/service";
import { createChatgptManager } from "../server/chatgpt/manager";
import {
  createCredentialVault,
  type VaultData,
  type CredentialVault,
} from "../server/chatgpt/vault";
import {
  verifyIdentity,
  parseGrant,
  planEnabled,
  pkceChallenge,
  SCOPES,
} from "../server/chatgpt/protocol";
import { chatgptCall } from "../server/chatgpt/transport";

const meta = {
  issuer: "https://auth.openai.com",
  authorization_endpoint: "https://auth.openai.com/api/accounts/authorize",
  token_endpoint: "https://auth.openai.com/api/accounts/oauth/token",
  jwks_uri: "https://auth.openai.com/.well-known/jwks.json",
  revocation_endpoint: "https://auth.openai.com/api/accounts/oauth/revoke",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const errorCode = (code: string) => (error: unknown) =>
  error instanceof ApiError && error.code === code;
const request: ModelRequest = {
  instructions: "Explain math",
  input: [{ role: "user", content: "What is a function?" }],
  schema: { type: "object" },
  name: "test",
  maxTokens: 900,
};
const completed = {
  type: "response.completed",
  response: {
    status: "completed",
    output: [
      {
        type: "message",
        content: [
          {
            type: "output_text",
            text: JSON.stringify({ reply: "Halo, pelajar! ✨" }),
          },
        ],
      },
    ],
  },
};
function stream(events: unknown[] = [completed], chunked = false) {
  const bytes = new TextEncoder().encode(
    events
      .map(
        (event) => `event: response\r\ndata: ${JSON.stringify(event)}\r\n\r\n`,
      )
      .join(""),
  );
  return new Response(
    new ReadableStream({
      start(controller) {
        if (chunked) {
          for (let i = 0; i < bytes.length; i += 7)
            controller.enqueue(bytes.slice(i, i + 7));
        } else controller.enqueue(bytes);
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } },
  );
}
function fixture() {
  let data: VaultData = {
    version: 1,
    hostId: `urn:uuid:${randomUUID()}`,
    activeId: null,
    provider: "chatgpt",
    accounts: [],
  };
  const vault: CredentialVault = {
    read: async () => structuredClone(data),
    write: async (next) => {
      data = structuredClone(next);
    },
  };
  const calls: {
    url: string;
    body?: URLSearchParams | Record<string, unknown>;
  }[] = [];
  let now = Date.now(),
    grants = SCOPES,
    identity = "student-one",
    client = "oaiapp_first",
    refreshes = 0,
    revocationFails = false,
    identityFails = false,
    modelFails = false;
  const fetcher: typeof fetch = async (url, init) => {
    const endpoint = String(url),
      body =
        init?.body instanceof URLSearchParams
          ? init.body
          : typeof init?.body === "string"
            ? JSON.parse(init.body)
            : undefined;
    calls.push({ url: endpoint, body });
    if (endpoint.endsWith("openid-configuration")) return json(meta);
    if (endpoint === meta.token_endpoint) {
      const form = body as URLSearchParams;
      if (form.get("grant_type") === "refresh_token") {
        refreshes++;
        return json({
          access_token: `fixture-access-refreshed-${refreshes}`,
          refresh_token: `fixture-refresh-rotated-${refreshes}`,
          token_type: "Bearer",
          expires_in: 3600,
        });
      }
      assert.notEqual(form.get("client_id"), "dynamic_agent_client");
      assert.equal(
        form.get("redirect_uri"),
        "http://127.0.0.1:5075/auth/callback",
      );
      return json({
        access_token: "fixture-access",
        refresh_token: "fixture-refresh",
        id_token: "fixture-id-token",
        token_type: "Bearer",
        expires_in: 3600,
        scope: grants,
      });
    }
    if (endpoint === "https://api.openai.com/v1/models")
      return modelFails
        ? json({}, 503)
        : json({
            models: [
              {
                slug: "fixture-first",
                display_name: "First model",
                visibility: "list",
              },
              {
                slug: "fixture-hidden",
                display_name: "Hidden",
                visibility: "hide",
              },
              {
                slug: "fixture-second",
                display_name: "Second model",
                visibility: "list",
              },
            ],
          });
    if (endpoint === "https://api.openai.com/v1/responses") return stream();
    if (endpoint === meta.revocation_endpoint)
      return new Response(null, { status: revocationFails ? 503 : 200 });
    throw new Error("Unexpected endpoint");
  };
  const manager = createChatgptManager({
    port: 5075,
    vault,
    api: {
      key: "fixture-api-key",
      model: "fixture-api-model",
      dailyLimit: 100,
    },
    fetcher,
    clock: () => now,
    verify: async (token, audience, nonce) => {
      assert.equal(token, "fixture-id-token");
      assert.equal(audience, client);
      assert.ok(nonce);
      if (identityFails) throw new ApiError(401, "chatgpt_invalid_identity");
      return {
        subject: identity,
        name: "Student",
        email: "student@example.test",
      };
    },
  });
  const start = async (accountId?: string) => {
    const ticket = await manager.handle("POST", "/api/ai/chatgpt/start", {
      accountId,
      returnTo: "http://localhost:5174/island/mathematics",
    });
    const url = new URL(ticket.url as string),
      begin = await manager.begin(url.searchParams.get("ticket")!);
    return {
      begin,
      url: new URL(begin.location),
      cookie: begin.cookie.split(";")[0],
    };
  };
  const finish = async (
    flow: Awaited<ReturnType<typeof start>>,
    extra: Record<string, string> = {},
  ) =>
    manager.callback(
      new URLSearchParams({
        state: flow.url.searchParams.get("state")!,
        code: "fixture-code",
        client_id: client,
        ...extra,
      }),
      flow.cookie,
    );
  return {
    manager,
    vault,
    calls,
    start,
    finish,
    read: () => data,
    advance: (ms: number) => {
      now += ms;
    },
    setGrants: (s: string) => {
      grants = s;
    },
    setIdentity: (s: string, c = "oaiapp_first") => {
      identity = s;
      client = c;
    },
    failIdentity: () => {
      identityFails = true;
    },
    failRevocation: () => {
      revocationFails = true;
    },
    failModels: () => {
      modelFails = true;
    },
    refreshCount: () => refreshes,
  };
}
let checks = 0;
async function test(name: string, run: () => void | Promise<void>) {
  await run();
  checks++;
  console.log(`✓ ${name}`);
}
await test("PKCE matches the RFC S256 example; malformed grant responses fail closed", () => {
  assert.equal(
    pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"),
    "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  );
  assert.ok(planEnabled(SCOPES.split(" ")));
  assert.equal(planEnabled(["openid", "profile"]), false);
  for (const value of [
    null,
    {},
    { access_token: "x", token_type: "Bearer", expires_in: 3600 },
    {
      access_token: "x",
      id_token: "i",
      scope: SCOPES,
      token_type: "Bearer",
      expires_in: -1,
    },
  ])
    assert.throws(
      () => parseGrant(value, Date.now()),
      errorCode("chatgpt_token_exchange_failed"),
    );
});
await test("New sign-in uses a one-time kickoff, stable host ID, loopback callback and fresh PKCE/state/nonce", async () => {
  const f = fixture();
  const a = await f.start(),
    b = await f.start();
  for (const flow of [a, b]) {
    const p = flow.url.searchParams;
    assert.equal(flow.url.origin, "https://auth.openai.com");
    assert.equal(p.get("client_id"), "dynamic_agent_client");
    assert.equal(p.get("agent_name_hint"), "Qwizo");
    assert.equal(p.get("redirect_uri"), "http://127.0.0.1:5075/auth/callback");
    assert.equal(p.get("resource"), "https://api.openai.com/v1");
    assert.ok(p.get("scope")?.includes("chatgpt.tokens.use.direct"));
    assert.equal(p.get("ext_agent_host_id"), f.read().hostId);
    assert.ok(flow.begin.cookie.includes("HttpOnly"));
    assert.ok(flow.begin.cookie.includes("SameSite=Lax"));
  }
  assert.notEqual(
    a.url.searchParams.get("state"),
    b.url.searchParams.get("state"),
  );
  assert.notEqual(
    a.url.searchParams.get("code_challenge"),
    b.url.searchParams.get("code_challenge"),
  );
  await assert.rejects(
    f.manager.begin(
      new URL(
        (await f.manager.handle("POST", "/api/ai/chatgpt/start", {}))
          .url as string,
      ).searchParams.get("missing") ?? "invalid",
    ),
  );
  await assert.rejects(
    f.manager.begin(new URL(a.begin.location).searchParams.get("state")!),
    errorCode("chatgpt_sign_in_expired"),
  );
});
await test("Bad state/cookie, duplicate callback fields, missing issued ID and expired attempts never exchange codes", async () => {
  const f = fixture(),
    flow = await f.start(),
    state = flow.url.searchParams.get("state")!;
  await assert.rejects(
    f.manager.callback(
      new URLSearchParams({
        state: "bad",
        code: "x",
        client_id: "oaiapp_first",
      }),
      flow.cookie,
    ),
    errorCode("chatgpt_invalid_callback"),
  );
  await assert.rejects(
    f.manager.callback(
      new URLSearchParams({ state, code: "x", client_id: "oaiapp_first" }),
      "qwizo_oauth=bad",
    ),
    errorCode("chatgpt_invalid_callback"),
  );
  await assert.rejects(
    f.manager.callback(
      new URLSearchParams(
        `state=${state}&state=${state}&code=x&client_id=oaiapp_first`,
      ),
      flow.cookie,
    ),
    errorCode("chatgpt_invalid_callback"),
  );
  assert.equal(f.calls.filter((c) => c.url === meta.token_endpoint).length, 0);
  const noId = await f.start();
  await assert.rejects(
    f.manager.callback(
      new URLSearchParams({
        state: noId.url.searchParams.get("state")!,
        code: "x",
      }),
      noId.cookie,
    ),
    errorCode("chatgpt_invalid_callback"),
  );
  const expired = await f.start();
  f.advance(600001);
  await assert.rejects(
    f.finish(expired),
    errorCode("chatgpt_invalid_callback"),
  );
});
await test("Successful callback saves the issued client, redacts secrets, loads account models and rejects replay", async () => {
  const f = fixture(),
    flow = await f.start();
  const response = await f.finish(flow);
  assert.equal(
    response.location,
    "http://localhost:5174/island/mathematics?chatgpt=connected",
  );
  assert.ok(response.cookie.includes("Max-Age=0"));
  const status = await f.manager.status();
  assert.equal(status.ready, true);
  assert.equal(status.authMode, "chatgpt");
  assert.equal(status.model, "fixture-first");
  const encoded = JSON.stringify(status);
  for (const secret of [
    "fixture-access",
    "fixture-refresh",
    "fixture-id-token",
    f.read().hostId,
    "oaiapp_first",
  ])
    assert.ok(!encoded.includes(secret));
  assert.equal(f.read().accounts[0].clientId, "oaiapp_first");
  assert.equal(f.read().accounts[0].identity.subject, "student-one");
  await assert.rejects(f.finish(flow), errorCode("chatgpt_invalid_callback"));
  const exchange = f.calls.find((c) => c.url === meta.token_endpoint)!
    .body as URLSearchParams;
  assert.equal(
    pkceChallenge(exchange.get("code_verifier")!),
    flow.url.searchParams.get("code_challenge"),
  );
});
await test("Denied or identity-only login never grants plan inference or falls back to paid API", async () => {
  const f = fixture(),
    denied = await f.start();
  const result = await f.manager.callback(
    new URLSearchParams({
      state: denied.url.searchParams.get("state")!,
      error: "access_denied",
    }),
    denied.cookie,
  );
  assert.ok(result.location.endsWith("chatgpt=denied"));
  assert.equal(f.read().accounts.length, 0);
  f.setGrants("openid profile email");
  const flow = await f.start();
  assert.ok((await f.finish(flow)).location.endsWith("permission_needed"));
  assert.equal((await f.manager.status()).ready, false);
  await assert.rejects(
    f.manager.call(request),
    errorCode("chatgpt_plan_unavailable"),
  );
  assert.equal(f.calls.filter((c) => c.url.endsWith("/responses")).length, 0);
});
await test("Reauthorization uses the original client ID and cannot replace an account with another identity", async () => {
  const f = fixture();
  await f.finish(await f.start());
  const account = f.read().accounts[0];
  const flow = await f.start(account.id);
  assert.equal(flow.url.searchParams.get("client_id"), "oaiapp_first");
  assert.equal(flow.url.searchParams.has("agent_name_hint"), false);
  assert.equal(flow.url.searchParams.get("id_token_hint"), "fixture-id-token");
  f.setIdentity("intruder");
  await assert.rejects(f.finish(flow), errorCode("chatgpt_invalid_identity"));
  assert.equal(f.read().accounts[0].identity.subject, "student-one");
  const mismatch = await f.start(account.id);
  await assert.rejects(
    f.finish(mismatch, { client_id: "oaiapp_different" }),
    errorCode("chatgpt_invalid_callback"),
  );
});
await test("Account/model selection remains separate for registrations with the same email", async () => {
  const f = fixture();
  await f.finish(await f.start());
  const first = f.read().accounts[0].id;
  f.setIdentity("student-two", "oaiapp_second");
  await f.finish(await f.start());
  const second = f.read().activeId;
  assert.equal(f.read().accounts.length, 2);
  assert.notEqual(first, second);
  await f.manager.handle("POST", "/api/ai/chatgpt/model", {
    model: "fixture-second",
  });
  assert.equal(
    f.read().accounts.find((a) => a.id === second)!.model,
    "fixture-second",
  );
  await f.manager.handle("POST", "/api/ai/chatgpt/select", {
    accountId: first,
  });
  assert.equal(f.read().activeId, first);
  assert.equal(f.read().accounts.find((a) => a.id === first)!.model, "");
  await assert.rejects(
    f.manager.handle("POST", "/api/ai/chatgpt/model", {
      model: "not-in-account-catalog",
    }),
    errorCode("invalid_request"),
  );
});
await test("Refreshes are serialized and rotating refresh credentials are saved together", async () => {
  const f = fixture();
  await f.finish(await f.start());
  f.advance(3590000);
  await Promise.all([f.manager.status(), f.manager.status()]);
  assert.equal(f.refreshCount(), 1);
  const grant = f.read().accounts[0].grant!;
  assert.equal(grant.accessToken, "fixture-access-refreshed-1");
  assert.equal(grant.refreshToken, "fixture-refresh-rotated-1");
  assert.ok(planEnabled(grant.scopes));
});
await test("Disconnect revokes renewable access, clears local tokens and reports failed revocation honestly", async () => {
  const f = fixture();
  await f.finish(await f.start());
  const id = f.read().activeId;
  const result = await f.manager.handle("POST", "/api/ai/chatgpt/disconnect", {
    accountId: id,
  });
  assert.equal(result.revoked, true);
  assert.equal(f.read().accounts[0].grant, null);
  assert.equal(f.read().activeId, null);
  assert.equal(f.read().accounts[0].clientId, "oaiapp_first");
  const g = fixture();
  await g.finish(await g.start());
  g.failRevocation();
  assert.equal(
    (await g.manager.handle("POST", "/api/ai/chatgpt/disconnect", {})).revoked,
    false,
  );
  assert.equal(g.read().accounts[0].grant, null);
  assert.equal(
    g.calls.filter((c) => c.url === meta.revocation_endpoint).length,
    2,
  );
});
await test("Model discovery failure does not imply a working plan, and API billing requires explicit selection", async () => {
  const f = fixture();
  assert.equal((await f.manager.status()).authMode, "chatgpt");
  await assert.rejects(
    f.manager.call(request),
    errorCode("chatgpt_sign_in_required"),
  );
  await f.finish(await f.start());
  f.failModels();
  const status = await f.manager.status();
  assert.equal(status.ready, false);
  assert.equal(
    (status.chatgpt as { notice: string }).notice,
    "chatgpt_models_unavailable",
  );
  await f.manager.handle("POST", "/api/ai/chatgpt/provider", {
    provider: "api-key",
  });
  assert.equal((await f.manager.status()).provider, "OpenAI API");
  await assert.rejects(
    f.manager.handle("POST", "/api/ai/chatgpt/start", {
      returnTo: "https://evil.example/world",
    }),
    errorCode("invalid_request"),
  );
});
await test("ChatGPT transport uses the selected account model and required streaming fields without API-only parameters", async () => {
  const call = chatgptCall(
    async () => ({
      accessToken: "fixture-oauth",
      model: "fixture-account-model",
    }),
    async (url, init) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.model, "fixture-account-model");
      assert.equal(body.store, false);
      assert.equal(body.stream, true);
      assert.equal(body.max_output_tokens, undefined);
      assert.equal(body.previous_response_id, undefined);
      assert.equal(body.temperature, undefined);
      assert.equal(body.text.format.strict, true);
      return stream([completed], true);
    },
  );
  assert.deepEqual(await call(request), { reply: "Halo, pelajar! ✨" });
});
await test("Usage limits, missing terminal events, interrupted streams and refusal are never treated as success", async () => {
  const auth = async () => ({
    accessToken: "fixture-oauth",
    model: "fixture-model",
  });
  await assert.rejects(
    chatgptCall(auth, async () =>
      stream([{ type: "response.output_text.delta", delta: "partial" }]),
    )(request),
    errorCode("chatgpt_stream_incomplete"),
  );
  await assert.rejects(
    chatgptCall(auth, async () =>
      stream([
        {
          type: "response.failed",
          response: {
            error: { code: "subscription_sharing_usage_limit_exceeded" },
          },
        },
      ]),
    )(request),
    errorCode("chatgpt_usage_limit"),
  );
  await assert.rejects(
    chatgptCall(auth, async () =>
      stream([
        {
          type: "response.failed",
          response: {
            error: { code: "subscription_sharing_usage_unavailable" },
          },
        },
      ]),
    )(request),
    errorCode("chatgpt_plan_unavailable"),
  );
  await assert.rejects(
    chatgptCall(auth, async () => new Response(null, { status: 401 }))(request),
    errorCode("chatgpt_sign_in_required"),
  );
  await assert.rejects(
    chatgptCall(auth, async () => new Response(null, { status: 429 }))(request),
    errorCode("chatgpt_usage_limit"),
  );
});
await test("ID tokens require a valid published signature, issuer, audience, expiry and nonce", async () => {
  const { publicKey, privateKey } = await generateKeyPair("RS256"),
    jwk = await exportJWK(publicKey),
    keys = createLocalJWKSet({ keys: [{ ...jwk, kid: "fixture" }] });
  const token = (
    claims: Record<string, unknown> = {},
    issuer = "https://auth.openai.com",
    aud = "oaiapp_fixture",
    exp = "5m",
  ) =>
    new SignJWT({
      nonce: "fixture-nonce",
      name: "Student",
      email: "student@example.test",
      ...claims,
    })
      .setProtectedHeader({ alg: "RS256", kid: "fixture" })
      .setIssuer(issuer)
      .setAudience(aud)
      .setSubject("fixture-subject")
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(privateKey);
  assert.equal(
    (
      await verifyIdentity(
        await token(),
        "oaiapp_fixture",
        "fixture-nonce",
        keys,
      )
    ).subject,
    "fixture-subject",
  );
  for (const jwt of [
    await token({ nonce: "wrong" }),
    await token({}, "https://evil.example"),
    await token({}, undefined, "other-audience"),
    await token({}, undefined, undefined, "-10m"),
    await token({ azp: "wrong-client" }),
  ])
    await assert.rejects(
      verifyIdentity(jwt, "oaiapp_fixture", "fixture-nonce", keys),
      errorCode("chatgpt_invalid_identity"),
    );
});
await test("Protected vault is atomic, preserves the host, returns isolated snapshots and never writes cleartext on Windows", async () => {
  const directory = await mkdtemp(resolve("tmp/tests/chatgpt-vault-"));
  const vault = createCredentialVault(directory);
  const [a, b] = await Promise.all([vault.read(), vault.read()]);
  assert.equal(a.hostId, b.hostId);
  a.provider = "api-key";
  await vault.write(a);
  const reopened = createCredentialVault(directory),
    saved = await reopened.read();
  assert.equal(saved.hostId, a.hostId);
  assert.equal(saved.provider, "api-key");
  saved.provider = "chatgpt";
  assert.equal((await reopened.read()).provider, "api-key");
  const file = await readFile(resolve(directory, "connections.dat"), "utf8");
  if (process.platform === "win32") assert.ok(!file.includes(a.hostId));
});
console.log(
  `Passed ${checks} ChatGPT sign-in/session/stream checks with mock OAuth/model endpoints; no real account credentials or inference used.`,
);
