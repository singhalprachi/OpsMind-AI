/**
 * Lightweight role-based access control.
 * If AUTH_API_KEY is set in env, incoming requests must include the same value
 * in header `x-api-key`. Role header `x-role` is optional and can be used
 * for downstream checks.
 */
export function requireApiKey(req, res, next) {
  const expected = process.env.AUTH_API_KEY;
  if (!expected) return next(); // RBAC disabled if no key configured

  const provided = req.header("x-api-key") || req.query.api_key;
  if (provided !== expected) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.role = req.header("x-role") || "user";
  next();
}
