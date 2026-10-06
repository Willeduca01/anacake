import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET ausente ou muito curta (mínimo 16 caracteres)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function criarSessao(username: string): Promise<string> {
  return new SignJWT({ sub: username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verificarSessao(
  token: string | undefined
): Promise<JWTPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

/**
 * Validação rigorosa de autenticação e autorização para Server Actions e APIs.
 * Lança erro 403 Forbidden caso a sessão seja inexistente, expirada ou não possua role 'admin'.
 */
export async function exigirSessaoAdmin(): Promise<JWTPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const sessao = await verificarSessao(token);
  if (!sessao || sessao.role !== "admin") {
    throw new Error("403 Forbidden: Sessão administrativa não autorizada.");
  }
  return sessao;
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;

