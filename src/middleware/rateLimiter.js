require("dotenv");
const rateLimit = require("express-rate-limit");
const { RateLimitError } = require("../utils/errors");

const rateLimiter = rateLimit({
  windowMs: 2 * 60 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 3 : 1000000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    return next(
      new RateLimitError("Too many requests. Please try again later.", {
        service: "rateLimiter",
        ip: req.ip,
        path: req.originalUrl,
        limit: options.limit,
        windowMs: options.windowMs,
      })
    );
  },
});

module.exports = rateLimiter;
