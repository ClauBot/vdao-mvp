/**
 * API Guard — rate limiting helper for route handlers.
 *
 * Usage in a route:
 *   const blocked = applyRateLimit(request, 'POST');
 *   if (blocked) return blocked;
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from './rate-limit';

const LIMITS = {
  GET: 60,    // 60 requests per minute
  POST: 10,   // 10 requests per minute
  PATCH: 10,
  DELETE: 5,
} as const;

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Apply rate limiting. Returns a 429 response if blocked, or null if allowed.
 */
export function applyRateLimit(
  request: NextRequest,
  method?: string
): NextResponse | null {
  const m = (method || request.method) as keyof typeof LIMITS;
  const limit = LIMITS[m] ?? 60;
  const ip = getClientIP(request);
  const path = new URL(request.url).pathname;
  const key = `${ip}:${m}:${path}`;

  const result = rateLimit(key, limit);

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return null;
}
