/* Session cookie: the Google refresh token is stored encrypted in an HttpOnly cookie. */
const crypto = require("crypto");
const COOKIE = "pf_session";
function key() { return crypto.createHash("sha256").update(process.env.COOKIE_SECRET || "").digest(); }
function seal(obj) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(JSON.stringify(obj), "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString("base64url");
}
function open(str) {
  try {
    const b = Buffer.from(str, "base64url");
    const d = crypto.createDecipheriv("aes-256-gcm", key(), b.subarray(0, 12));
    d.setAuthTag(b.subarray(12, 28));
    return JSON.parse(Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8"));
  } catch (e) { return null; }
}
function cookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach(p => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function setCookie(res, name, value, maxAge) {
  const v = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
  const prev = res.getHeader("Set-Cookie") || [];
  res.setHeader("Set-Cookie", [].concat(prev, v));
}
function session(req) { const v = cookies(req)[COOKIE]; return v ? open(v) : null; }
module.exports = { COOKIE, seal, open, cookies, setCookie, session };
