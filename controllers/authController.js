/**
 * controllers/authController.js
 *
 * 인증(Authentication) 관련 비즈니스 로직 담당
 * - 사용자 로그인 / 로그아웃
 * - 회원가입
 * - 로그인 시점 기록
 */

const passport = require("passport");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

/**
 * 로그인 페이지 렌더링
 */
exports.renderLoginPage = (req, res) => {
  // 로그인 실패 시 전달된 메시지 표시
  const error = req.query.error;
  res.render("login", { error });
};

/**
 * 회원가입 페이지 렌더링
 */
exports.renderRegisterPage = (req, res) => {
  const error = req.query.error || null;
  res.render("register", { error });
};

/**
 * 회원가입 처리
 * - 학번은 PK이므로 중복 가입 방지
 */
exports.register = async (req, res) => {
  const { studentId, name, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (id, name, password) VALUES (?, ?, ?)",
      [studentId, name, hash]
    );

    res.redirect("/");
  } catch (err) {
    // 학번 중복 (PK 제약 조건 위반)
    if (err.code === "ER_DUP_ENTRY") {
      return res.redirect(
        "/register?error=" +
          encodeURIComponent("이미 가입한 사용자입니다.")
      );
    }

    console.error("회원가입 오류:", err);
    res.send("회원가입 중 오류가 발생했습니다.");
  }
};

/**
 * 로그인 처리
 * - Passport local strategy 사용
 * - 로그인 실패 시 alert 메시지 전달
 * - 로그인 성공 시 세션에 로그인 시각 기록
 */
exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    // 로그인 실패
    if (!user) {
      const message = info?.message || "로그인에 실패했습니다.";
      return res.redirect(`/?error=${encodeURIComponent(message)}`);
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      // 로그인 시점 기록 (세션 타이머 기준)
      req.session.loginAt = Date.now();

      return res.redirect("/setting");
    });
  })(req, res, next);
};

/**
 * 로그아웃 처리
 */
exports.logout = (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
};
