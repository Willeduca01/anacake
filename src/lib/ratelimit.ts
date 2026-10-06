import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Configuração Upstash Redis
const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Rate Limiters para produção com Upstash
const loginRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 tentativas por minuto
      analytics: true,
      prefix: "ratelimit:login",
    })
  : null;

const pedidosRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 pedidos por minuto
      analytics: true,
      prefix: "ratelimit:pedidos",
    })
  : null;

// Fallback em memória para desenvolvimento local caso Upstash não esteja configurado
type MemoryRecord = { count: number; expiresAt: number };
const memoryStore = new Map<string, MemoryRecord>();

function memoryLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.expiresAt) {
    memoryStore.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= max) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Obtém o IP do cliente de forma segura inspecionando os headers da Vercel / proxy reverso.
 */
export async function obterClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    const clientIp = forwardedFor.split(",")[0]?.trim();
    if (clientIp) return clientIp;
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

/**
 * Aplica Rate Limit estrito para tentativas de login (5 req/min).
 */
export async function verificarRateLimitLogin(
  ip: string
): Promise<{ success: boolean }> {
  if (loginRateLimiter) {
    const { success } = await loginRateLimiter.limit(ip);
    return { success };
  }

  // Fallback em memória: 5 requisições por 60 segundos
  const success = memoryLimit(`login:${ip}`, 5, 60_000);
  return { success };
}

/**
 * Aplica Rate Limit moderado para criação de pedidos (10 req/min).
 */
export async function verificarRateLimitPedidos(
  ip: string
): Promise<{ success: boolean }> {
  if (pedidosRateLimiter) {
    const { success } = await pedidosRateLimiter.limit(ip);
    return { success };
  }

  // Fallback em memória: 10 requisições por 60 segundos
  const success = memoryLimit(`pedidos:${ip}`, 10, 60_000);
  return { success };
}
