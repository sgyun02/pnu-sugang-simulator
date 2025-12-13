/**
 * routes/setting.js
 *
 * 수강신청 환경설정 관련 라우터
 * - 과목 관리 (CRUD)
 * - 수강신청 환경 설정 저장
 */

const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");
const settingController = require("../controllers/settingController");

// 설정 페이지
router.get("/", isLoggedIn, settingController.renderSettingPage);

// 기존 과목 수정
router.put("/course/:id", isLoggedIn, settingController.updateCourse);

// 새 과목 추가
router.post("/course", isLoggedIn, settingController.createCourse);

// 과목 삭제
router.delete("/course/:id", isLoggedIn, settingController.deleteCourse);

// 환경 설정 저장
router.post("/env", isLoggedIn, settingController.saveEnvironment);

module.exports = router;






