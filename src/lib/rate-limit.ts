const cache = new Map<string, { count: number; expires: number }>();

export function checkRateLimit(ip: string, limit: number = 20, windowMs: number = 60000) {
  const now = Date.now();
  const userData = cache.get(ip);

  if (!userData || now > userData.expires) {
    cache.set(ip, { count: 1, expires: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (userData.count >= limit) {
    return { success: false, remaining: 0 };
  }

  userData.count++;
  return { success: true, remaining: limit - userData.count };
}
