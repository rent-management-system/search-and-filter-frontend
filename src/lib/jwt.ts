// Lightweight JWT decoder (no signature verification). For display-only use.
export type DecodedJWT = {
  sub?: string;
  email?: string;
  role?: string;
  phone_number?: string;
  preferred_language?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
};

function base64UrlDecode(input: string): string {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const decoded = atob(padded);
    // handle UTF-8
    const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  } catch {
    return '';
  }
}

export function decodeJwt(token?: string | null): DecodedJWT | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payload = base64UrlDecode(parts[1]);
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
