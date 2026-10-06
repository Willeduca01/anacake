import DOMPurify from "dompurify";

/**
 * Sanitiza texto removendo completamente quaisquer tags HTML, scripts ou entidades maliciosas.
 * Funciona de forma transparente e segura tanto no servidor (Server Actions/APIs) quanto no cliente.
 */
export function sanitizarTexto(input: string | null | undefined): string {
  if (!input) return "";

  // No navegador, utiliza o DOMPurify nativo
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    }).trim();
  }

  // No servidor (Node.js/Serverless), higieniza sem necessitar do pesado e incompatível jsdom
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:/gi, "")
    .trim();
}

/**
 * Sanitiza HTML para permitir apenas formatação segura caso algum componente utilize renderização rica.
 */
export function sanitizarHtml(input: string | null | undefined): string {
  if (!input) return "";

  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "span"],
      ALLOWED_ATTR: ["class"],
    });
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}
