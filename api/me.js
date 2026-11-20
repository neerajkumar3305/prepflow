/* Tells the app whether this browser is signed in, and with which Google account. */
const { session } = require("../lib/session");
module.exports = (req, res) => {
  const s = session(req);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(s ? { signedIn: true, email: s.email } : { signedIn: false }));
};
