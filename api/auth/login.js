/* Starts Google sign-in. The account chooser lets you pick the Google account on any device. */
const crypto = require("crypto");
const { setCookie } = require("../../lib/session");
module.exports = (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  setCookie(res, "pf_state", state, 600);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `https://${req.headers.host}/api/auth/callback`,
    response_type: "code",
    scope: "openid email https://www.googleapis.com/auth/drive.file",
    access_type: "offline",
    prompt: "select_account consent",
    state
  });
  res.writeHead(302, { Location: "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString() });
  res.end();
};
