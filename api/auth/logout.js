const { setCookie, COOKIE } = require("../../lib/session");
module.exports = (req, res) => {
  setCookie(res, COOKIE, "", 0);
  res.writeHead(302, { Location: "/" });
  res.end();
};
