/**
 * TOKEN BUCKET RATE LIMITER (In-Memory)
 *
 * Implements a strict sliding-window token bucket algorithm to protect
 * critical API routes from spam, scraping, or DDoS attacks.
 *
 * PARAMETERS:
 * - limit: Max requests allowed in the window.
 * - windowMs: Time window duration in milliseconds.
 *
 * WHY GLOBAL BUCKET BINDING?
 * Next.js clears active module caches during hot reload (HMR) in development.
 * Storing rate limit counters in a simple local file map would reset counters
 * on every code update. Pinning it to the Node `global` context preserves
 * states across HMR runs.
 */

interface RateLimitBucket {
  tokens: number;
  lastRefilled: number;
}

export class InMemoryRateLimiter {
  private buckets = new Map<string, RateLimitBucket>();
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /**
   * Check if a client key (e.g. IP address or User ID) is allowed to proceed.
   *
   * @returns An object containing `allowed: boolean`, `remaining: number`, and `retryAfterMs: number`.
   */
  check(key: string): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = {
        tokens: this.limit,
        lastRefilled: now,
      };
      this.buckets.set(key, bucket);
    }

    // Refill tokens based on elapsed time since last request
    const elapsed = now - bucket.lastRefilled;
    // Calculate how many tokens should be added back
    const refillAmount = Math.floor(elapsed * (this.limit / this.windowMs));
    
    if (refillAmount > 0) {
      bucket.tokens = Math.min(this.limit, bucket.tokens + refillAmount);
      bucket.lastRefilled = now;
    }

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      this.buckets.set(key, bucket);
      return {
        allowed: true,
        remaining: bucket.tokens,
        retryAfterMs: 0,
      };
    }

    // Bucket is empty, calculate when the next token will be refilled
    const nextRefillTime = bucket.lastRefilled + (this.windowMs / this.limit);
    const retryAfterMs = Math.max(0, Math.ceil(nextRefillTime - now));

    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    };
  }
}

// Global registry singleton cache
const globalForLimiter = global as unknown as {
  uploadLimiter?: InMemoryRateLimiter;
  generateLimiter?: InMemoryRateLimiter;
};

// Limit uploads to 10 per minute
export const uploadRateLimiter =
  globalForLimiter.uploadLimiter || new InMemoryRateLimiter(10, 60 * 1000);

// Limit AI generations to 5 per minute
export const generateRateLimiter =
  globalForLimiter.generateLimiter || new InMemoryRateLimiter(5, 60 * 1000);

if (process.env.NODE_ENV !== "production") {
  globalForLimiter.uploadLimiter = uploadRateLimiter;
  globalForLimiter.generateLimiter = generateRateLimiter;
}
