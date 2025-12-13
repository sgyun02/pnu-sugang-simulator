/**
 * middlewares/isLoggedIn.js
 *
 * 로그인 여부를 확인하는 인증 미들웨어
 * 인증되지 않은 사용자는 로그인 페이지로 리다이렉트한다.
 */
module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log("NOT AUTHENTICATED");
  res.redirect("/");
};
