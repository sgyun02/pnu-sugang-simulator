/**
 * config/passport.js
 *
 * Passport Local Strategy 설정 파일
 * - 학번(studentId)과 비밀번호 기반 로그인 인증
 * - bcrypt를 이용한 비밀번호 해시 비교
 * - 세션 직렬화 / 역직렬화 설정
 */

const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const pool = require("./db");

module.exports = (passport) => {

  /**
   * ==============================
   * Local Strategy
   * ==============================
   * 로그인 시 입력된 학번과 비밀번호를 검증한다.
   */
  passport.use(
    new LocalStrategy(
      {
        usernameField: "studentId", // login.ejs의 input name
        passwordField: "password",
      },
      async (id, password, done) => {
        try {
          // 사용자 조회
          const [[user]] = await pool.query(
            "SELECT * FROM users WHERE id = ?",
            [id]
          );

          // 학번이 존재하지 않는 경우
          if (!user) {
            return done(null, false, { message: "존재하지 않는 사용자입니다." });
          }

          // 비밀번호 비교
          const match = await bcrypt.compare(password, user.password);
          if (!match) {
            return done(null, false, { message: "비밀번호가 일치하지 않습니다." });
          }

          // 인증 성공
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  /**
   * ==============================
   * Serialize User
   * ==============================
   * 로그인 성공 시 사용자 ID만 세션에 저장
   */
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  /**
   * ==============================
   * Deserialize User
   * ==============================
   * 세션에 저장된 ID를 기반으로
   * 매 요청마다 사용자 정보를 복원
   */
  passport.deserializeUser(async (id, done) => {
    try {
      const [[user]] = await pool.query(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

