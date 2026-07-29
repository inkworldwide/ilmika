interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

/**
 * Basic in-memory rate limiter for server endpoints.
 * @param key Unique key for identifier (e.g. IP address or User ID)
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window duration in milliseconds (default 1 minute)
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; headers: Record<string, string> } {
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": (limit - 1).toString(),
        "X-RateLimit-Reset": (now + windowMs).toString(),
      },
    };
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return {
      success: true,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": (limit - 1).toString(),
        "X-RateLimit-Reset": record.resetTime.toString(),
      },
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": record.resetTime.toString(),
        "Retry-After": Math.ceil((record.resetTime - now) / 1000).toString(),
      },
    };
  }

  record.count += 1;
  return {
    success: true,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": (limit - record.count).toString(),
      "X-RateLimit-Reset": record.resetTime.toString(),
    },
  };
}

/**
 * Extracts client IP address from request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "127.0.0.1";
}
