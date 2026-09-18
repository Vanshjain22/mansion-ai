import { describe, expect, it } from "vitest";
import { InMemoryRateLimiter } from "@/lib/utils/rate-limiter";
import { isMockBillingEnabled } from "@/lib/stripe/client";

describe("InMemoryRateLimiter", () => {
  it("allows requests up to its limit and blocks the next request", () => {
    const limiter = new InMemoryRateLimiter(2, 60_000);

    expect(limiter.check("user-1")).toMatchObject({ allowed: true, remaining: 1 });
    expect(limiter.check("user-1")).toMatchObject({ allowed: true, remaining: 0 });

    const blocked = limiter.check("user-1");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("keeps limits independent for different keys", () => {
    const limiter = new InMemoryRateLimiter(1, 60_000);

    expect(limiter.check("user-1").allowed).toBe(true);
    expect(limiter.check("user-2").allowed).toBe(true);
    expect(limiter.check("user-1").allowed).toBe(false);
  });
});

describe("isMockBillingEnabled", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalStripeKey = process.env.STRIPE_SECRET_KEY;

  function restoreEnvironment() {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;

    if (originalStripeKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalStripeKey;
  }

  it("is never enabled in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.STRIPE_SECRET_KEY;

    expect(isMockBillingEnabled()).toBe(false);
    restoreEnvironment();
  });

  it("is available locally only when Stripe is unconfigured", () => {
    process.env.NODE_ENV = "development";
    delete process.env.STRIPE_SECRET_KEY;
    expect(isMockBillingEnabled()).toBe(true);

    process.env.STRIPE_SECRET_KEY = "sk_test_configured";
    expect(isMockBillingEnabled()).toBe(false);
    restoreEnvironment();
  });
});
