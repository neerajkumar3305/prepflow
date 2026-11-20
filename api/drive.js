/* Loads and saves the PrepFlow progress file in the signed-in account's Google Drive. */
const { session } = require("../lib/session");
const NAME = "prepflow-backup.json";
async function accessToken(rt) {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: rt,
      grant_type: "refresh_token"
    })
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("token refresh failed");
  return j.access_token;
}
async function findFile(tok) {
  const q = encodeURIComponent(`name='${NAME}' and trashed=false`);
  const j = await (await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`, { headers: { Authorization: "Bearer " + tok } })).json();
  return j.files && j.files[0] ? j.files[0].id : null;
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => { data += c; });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}
module.exports = async (req, res) => {
  const s = session(req);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  if (!s) { res.statusCode = 401; return res.end(JSON.stringify({ error: "not signed in" })); }
  try {
    const tok = await accessToken(s.rt);
    const id = await findFile(tok);
    if (req.method === "GET") {
      if (!id) return res.end(JSON.stringify({ found: false }));
      const text = await (await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, { headers: { Authorization: "Bearer " + tok } })).text();
      return res.end(JSON.stringify({ found: true, data: JSON.parse(text) }));
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      if (id) {
        const r = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`, {
          method: "PATCH", headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" }, body });
        if (!r.ok) throw new Error("upload failed");
      } else {
        const boundary = "pf" + Date.now();
        const meta = JSON.stringify({ name: NAME, mimeType: "application/json" });
        const multi = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
        const r = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
          method: "POST", headers: { Authorization: "Bearer " + tok, "Content-Type": `multipart/related; boundary=${boundary}` }, body: multi });
        if (!r.ok) throw new Error("create failed");
      }
      return res.end(JSON.stringify({ ok: true }));
    }
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "method not allowed" }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(e.message || e) }));
  }
};
