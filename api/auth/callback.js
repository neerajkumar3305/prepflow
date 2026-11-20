/* Google sends the user back here. Exchanges the code for tokens and stores the session cookie. */
const { seal, cookies, setCookie, COOKIE } = require("../../lib/session");
module.exports = async (req, res) => {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get("code"), state = url.searchParams.get("state");
  if (!code || !state || state !== cookies(req).pf_state) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.end("Sign-in could not be verified. Please try again.");
  }
  const tr = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `https://${req.headers.host}/api/auth/callback`,
      grant_type: "authorization_code"
    })
  });
  const t = await tr.json();
  if (!t.refresh_token) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.end("Google did not return a refresh token. Remove PrepFlow from your Google account permissions and try again.");
  }
  const ui = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: "Bearer " + t.access_token } }).then(r => r.json());
  setCookie(res, COOKIE, seal({ rt: t.refresh_token, email: ui.email || "" }), 60 * 60 * 24 * 30);
  setCookie(res, "pf_state", "", 0);
  res.writeHead(302, { Location: "/" });
  res.end();
};
