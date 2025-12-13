/**
 * routes/auth.js
 *
 * 인증(Authentication) 관련 라우터
 * - 로그인
 * - 회원가입
 * - 로그아웃
 *
 * 실제 로직은 authController로 분리한다.
 */

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// 로그인 페이지
router.get("/", authController.renderLoginPage);

// 회원가입 페이지
router.get("/register", authController.renderRegisterPage);

// 회원가입 처리
router.post("/register", authController.register);

// 로그인 처리
router.post("/login", authController.login);

// 로그아웃
router.get("/logout", authController.logout);

module.exports = router;

