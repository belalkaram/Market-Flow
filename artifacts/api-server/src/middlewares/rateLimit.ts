import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV !== "production";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 50 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "محاولات كثيرة جداً، حاول مجدداً بعد 15 دقيقة", code: "RATE_LIMITED" },
});

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "تجاوزت حد التسجيل المسموح به، حاول لاحقاً", code: "RATE_LIMITED" },
});

export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "تجاوزت حد المحاولات المسموح، حاول بعد ساعة", code: "RATE_LIMITED" },
});

export const exportRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "تجاوزت حد التصدير المسموح، حاول لاحقاً", code: "RATE_LIMITED" },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 1000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "طلبات كثيرة جداً، حاول لاحقاً", code: "RATE_LIMITED" },
  skip: (req) => req.path === "/api/healthz",
});
