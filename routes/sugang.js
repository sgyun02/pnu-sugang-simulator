/**
 * routes/sugang.js
 *
 * 모의 수강신청 관련 라우터
 * - 수강신청 페이지
 * - 수강신청 시도
 * - 수강신청 내역 삭제
 */

const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");
const sugangController = require("../controllers/sugangController");

// 수강신청 페이지
router.get("/", isLoggedIn, sugangController.renderSugangPage);

// 수강신청 시도
router.post("/apply", isLoggedIn, sugangController.applyCourse);

// 수강신청 내역 삭제
router.post("/delete", isLoggedIn, sugangController.deleteAppliedCourse);

module.exports = router;





