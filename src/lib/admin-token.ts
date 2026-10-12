// Token de sesión del admin. Solo usa Web Crypto para que funcione también en el middleware (Edge).

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 horas

const encoder = new TextEncoder();

async function hmacHex(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** El valor de la cookie es un HMAC derivado de la contraseña, nunca la contraseña. */
export async function createAdminToken(password: string): Promise<string> {
  return hmacHex(password, "voltio-admin-session-v1");
}

export async function isValidAdminToken(token: string | undefined, password: string | undefined): Promise<boolean> {
  if (!token || !password) return false;
  return safeEqual(token, await createAdminToken(password));
}

/** Compara la contraseña escrita con la real en tiempo constante (comparando sus HMAC). */
export async function passwordMatches(input: string, password: string | undefined): Promise<boolean> {
  if (!password) return false;
  return safeEqual(await hmacHex(password, "check"), await hmacHex(input, "check"));
}
