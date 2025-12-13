/** app.js 
 
 * Express 기반 웹 서버의 진입점(Entry Point)
 * - 미들웨어 설정
 * - 세션 및 Passport 인증 설정
 * - 라우터 등록
 * - 서버 실행
 *
 * 실제 비즈니스 로직은 routes / controllers 계층에 분리하여 관리한다.
 */

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const methodOverride = require("method-override");
require("dotenv").config();

const app = express();

/**
 * ==============================
 * DB 연결 확인
 * ==============================
 * 서버 시작 시 MySQL 연결 여부를 확인하여
 * DB 오류로 인한 런타임 문제를 사전에 방지한다.
 */
const pool = require("./config/db");

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("MySQL connected");
    conn.release();
  } catch (err) {
    console.error("MySQL connection failed");
    console.error(err);
    process.exit(1);
  }
})();

/**
 * ==============================
 * Passport 인증 설정
 * ==============================
 * 로그인 인증(local strategy) 및
 * 세션 기반 사용자 식별을 위한 설정
 */
require("./config/passport")(passport);

/**
 * ==============================
 * View Engine 설정
 * ==============================
 * EJS 템플릿 엔진을 사용하여
 * 서버 사이드 렌더링 방식의 페이지를 제공한다.
 */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/**
 * ==============================
 * 공통 미들웨어 설정
 * ==============================
 */
app.use(express.urlencoded({ extended: true })); // form 데이터 처리
app.use(express.json()); // JSON 요청 처리
app.use(express.static(path.join(__dirname, "public"))); // 정적 파일 제공

/**
 * ==============================
 * 세션 설정
 * ==============================
 * 로그인 상태 유지를 위해 express-session 사용
 * - 세션 만료 시간: 30분
 */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000, // 30분
    },
  })
);

/**
 * ==============================
 * Passport 미들웨어
 * ==============================
 * 세션 기반 인증 처리
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * ==============================
 * HTTP Method Override
 * ==============================
 * HTML form의 한계를 보완하기 위해
 * PUT, DELETE 메서드 사용
 */
app.use(methodOverride("_method"));

/**
 * ==============================
 * Router 설정
 * ==============================
 * URL별 요청을 각 라우터 파일로 분리
 */
app.use("/", require("./routes/auth"));
app.use("/setting", require("./routes/setting"));
app.use("/sugang", require("./routes/sugang"));

/**
 * ==============================
 * 서버 실행
 * ==============================
 */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});



