import { randomBytes, createHash } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { ApiError } from "../service";

export const ISSUER = "https://auth.openai.com";
export const RESOURCE = "https://api.openai.com/v1";
export const SCOPES =
  "openid profile email offline_access resource.invoke chatgpt.tokens.use.direct";
export interface Discovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  revocation_endpoint?: string;
}
export interface Identity {
  subject: string;
  name: string;
  email: string;
}
export interface Grant {
  accessToken: string;
  refreshToken: string | null;
  idToken: string;
  expiresAt: number;
  scopes: string[];
}
export const opaque = () => randomBytes(32).toString("base64url");
export const pkceChallenge = (verifier: string) =>
  createHash("sha256").update(verifier).digest("base64url");
export const planEnabled = (scopes: string[]) =>
  scopes.includes("chatgpt.tokens.use.direct") &&
  scopes.includes("resource.invoke");
export async function discover(
  fetcher: typeof fetch = fetch,
): Promise<Discovery> {
  let response: Response;
  try {
    response = await fetcher(`${ISSUER}/.well-known/openid-configuration`, {
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new ApiError(503, "chatgpt_connection_unavailable");
  }
  if (!response.ok) throw new ApiError(503, "chatgpt_connection_unavailable");
  const data = (await response.json()) as Discovery;
  if (data.issuer !== ISSUER)
    throw new ApiError(502, "chatgpt_invalid_identity");
  for (const key of [
    "authorization_endpoint",
    "token_endpoint",
    "jwks_uri",
  ] as const) {
    if (typeof data[key] !== "string" || new URL(data[key]).origin !== ISSUER)
      throw new ApiError(502, "chatgpt_invalid_identity");
  }
  if (
    data.revocation_endpoint &&
    new URL(data.revocation_endpoint).origin !== ISSUER
  )
    throw new ApiError(502, "chatgpt_invalid_identity");
  return data;
}
export async function verifyIdentity(
  token: string,
  clientId: string,
  nonce: string | undefined,
  jwks: JWTVerifyGetKey,
): Promise<Identity> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: ISSUER,
      audience: clientId,
      algorithms: ["RS256", "ES256"],
      requiredClaims: ["sub", "exp", "iat"],
      clockTolerance: 5,
    });
    if (
      !payload.sub ||
      (nonce !== undefined && payload.nonce !== nonce) ||
      (payload.azp !== undefined && payload.azp !== clientId) ||
      (Array.isArray(payload.aud) &&
        payload.aud.length > 1 &&
        payload.azp !== clientId)
    )
      throw new Error();
    return {
      subject: payload.sub,
      name: typeof payload.name === "string" ? payload.name : "ChatGPT",
      email: typeof payload.email === "string" ? payload.email : "",
    };
  } catch {
    throw new ApiError(401, "chatgpt_invalid_identity");
  }
}
export const identityVerifier = (discovery: Discovery) => {
  const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));
  return (token: string, clientId: string, nonce?: string) =>
    verifyIdentity(token, clientId, nonce, jwks);
};
export function parseGrant(
  data: unknown,
  now: number,
  previous?: Grant,
): Grant {
  if (!data || typeof data !== "object")
    throw new ApiError(502, "chatgpt_token_exchange_failed");
  const token = data as Record<string, unknown>;
  if (
    typeof token.access_token !== "string" ||
    !token.access_token ||
    token.token_type?.toString().toLowerCase() !== "bearer" ||
    typeof token.expires_in !== "number" ||
    !Number.isFinite(token.expires_in) ||
    token.expires_in <= 0 ||
    token.expires_in > 86400 * 30
  )
    throw new ApiError(502, "chatgpt_token_exchange_failed");
  const idToken =
    typeof token.id_token === "string" ? token.id_token : previous?.idToken;
  if (!idToken) throw new ApiError(502, "chatgpt_token_exchange_failed");
  if (token.scope !== undefined && typeof token.scope !== "string")
    throw new ApiError(502, "chatgpt_token_exchange_failed");
  if (!previous && typeof token.scope !== "string")
    throw new ApiError(502, "chatgpt_token_exchange_failed");
  return {
    accessToken: token.access_token,
    refreshToken:
      typeof token.refresh_token === "string"
        ? token.refresh_token
        : (previous?.refreshToken ?? null),
    idToken,
    expiresAt: now + token.expires_in * 1000,
    scopes:
      typeof token.scope === "string"
        ? token.scope.split(/\s+/).filter(Boolean)
        : previous!.scopes,
  };
}
