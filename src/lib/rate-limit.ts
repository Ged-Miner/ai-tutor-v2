import { NextResponse } from 'next/server';

/**
 * Rate limiting store for tracking requests
 * In-memory store (for production, consider Redis)
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiter configuration
 */
interface RateLimiterConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (body: Record<string, unknown>) => string;
  message?: string;
}

/**
 * Rate limit result with headers
 */
export interface RateLimitResult {
  allowed: boolean;
  headers: Record<string, string>;
  response?: NextResponse;
}

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Apply rate limiting to a request
 * Returns result with rate limit info and optional error response
 */
export async function applyRateLimit(
  request: Request,
  config: RateLimiterConfig
): Promise<RateLimitResult> {
  try {
    const body = await request.json() as Record<string, unknown>;
    const key = config.keyGenerator(body);

    if (Math.random() < 0.01) {
      cleanupExpiredEntries();
    }

    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      const newEntry = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(key, newEntry);

      return {
        allowed: true,
        headers: {
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': String(config.maxRequests - 1),
          'X-RateLimit-Reset': String(Math.ceil(newEntry.resetTime / 1000)),
        },
      };
    }

    const remaining = Math.max(0, config.maxRequests - entry.count);

    if (entry.count >= config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      return {
        allowed: false,
        headers: {
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
          'Retry-After': String(retryAfter),
        },
        response: NextResponse.json(
          {
            error: 'Too many requests',
            message: config.message || 'You have exceeded the rate limit. Please try again later.',
            retryAfter,
          },
          { status: 429 }
        ),
      };
    }

    entry.count += 1;
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': String(config.maxRequests),
        'X-RateLimit-Remaining': String(remaining - 1),
        'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
      },
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return {
      allowed: true,
      headers: {},
    };
  }
}

export const transcriptUploadLimiter: RateLimiterConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyGenerator: (body: Record<string, unknown>) => {
    const courseCode = body.courseCode;
    if (typeof courseCode === 'string') {
      return `transcript:${courseCode}`;
    }
    return 'transcript:unknown';
  },
  message: 'Too many transcript uploads. Please wait before uploading again.',
};
