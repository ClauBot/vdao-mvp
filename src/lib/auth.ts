/**
 * SIWE Auth — JWT session management
 *
 * Flow:
 * 1. Client GETs /api/auth/nonce → random nonce
 * 2. Client signs SIWE message with wallet
 * 3. Client POSTs /api/auth/verify with message + signature
 * 4. Server verifies signature, issues JWT cookie
 * 5. Protected routes read JWT to get wallet address
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'vdao-dev-secret-change-in-production'
);

const COOKIE_NAME = 'vdao-session';
const JWT_EXPIRY = '7d';

// In-memory nonce store (good enough for MVP, use Redis in production)
const nonceStore = new Map<string, number>();

// Clean expired nonces every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [nonce, expires] of nonceStore) {
    if (expires < now) nonceStore.delete(nonce);
  }
}, 5 * 60 * 1000);

export function generateNonce(): string {
  const nonce = randomBytes(16).toString('hex');
  // Nonce valid for 5 minutes
  nonceStore.set(nonce, Date.now() + 5 * 60 * 1000);
  return nonce;
}

export function consumeNonce(nonce: string): boolean {
  const expires = nonceStore.get(nonce);
  if (!expires || expires < Date.now()) return false;
  nonceStore.delete(nonce);
  return true;
}

export async function createSession(wallet: string): Promise<string> {
  const token = await new SignJWT({ wallet: wallet.toLowerCase() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<{ wallet: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (typeof payload.wallet !== 'string') return null;
    return { wallet: payload.wallet };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Helper for protected API routes.
 * Returns the authenticated wallet or null.
 */
export async function requireAuth(): Promise<string | null> {
  const session = await getSession();
  return session?.wallet ?? null;
}
