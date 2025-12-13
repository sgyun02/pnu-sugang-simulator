/**
 * controllers/sugangController.js
 *
 * 모의 수강신청 비즈니스 로직 담당
 * - 희망 과목 목록 조회
 * - 수강신청 시도 및 실패 확률 계산
 * - 중복 과목 / 시간 충돌 검사
 * - 수강신청 내역 관리
 */

const pool = require("../config/db");

/**
 * 수강신청 페이지 렌더링
 */
exports.renderSugangPage = async (req, res) => {
  const userId = req.user.id;

  // 로그인 시각이 없는 경우 초기화
  if (!req.session.loginAt) {
    req.session.loginAt = Date.now();
  }

  const hidden = req.session.hiddenApplied || [];

  /**
   * 희망과목 담기 목록 (status: 0,1)
   */
  const [beforeCourses] = await pool.query(
    `SELECT * FROM courses
     WHERE user_id=? AND status IN (0,1)
     ORDER BY order_no ASC`,
    [userId]
  );

  /**
   * 수강신청 결과 목록 (status: 1,2)
   */
  const [appliedCoursesRaw] = await pool.query(
    `SELECT * FROM courses
     WHERE user_id=? AND status IN (1,2)
     ORDER BY order_no ASC`,
    [userId]
  );

  // 화면에 표시할 과목만 필터링
  const appliedCourses = appliedCoursesRaw.filter(
    (c) => !hidden.includes(c.id)
  );

  // 실제 취득 학점 (화면에 보이는 과목 기준)
  const earnedCredit = appliedCourses.reduce(
    (sum, c) => sum + (c.credit || 0),
    0
  );

  res.render("sugang", {
    user: req.user,
    beforeCourses,
    appliedCoursesRaw,
    earnedCredit,
    maxCredit: req.user.max_credit,
    loginAt: req.session.loginAt,
  });
};

/**
 * 수강신청 시도 처리
 * - 중복 과목 및 시간 충돌 검사
 * - 시간 경과에 따른 실패 확률 증가
 * - 성공 시 상태 변경
 */
exports.applyCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;

  // 신청 대상 과목
  const [[target]] = await pool.query(
    "SELECT * FROM courses WHERE id=? AND user_id=?",
    [courseId, userId]
  );

  /**
   * 중복 검사
   * - 과목명 또는 시간 정보가 동일한 경우 실패
   */
  const [dup] = await pool.query(
    `SELECT * FROM courses
     WHERE user_id=? AND id!=?
     AND status IN (1,2)
     AND (course_name=? OR time_info=?)`,
    [userId, courseId, target.course_name, target.time_info]
  );

  if (dup.length > 0) {
    return res.json({
      success: false,
      message: "이미 신청된 과목이거나 시간이 중복됩니다.",
    });
  }

  /**
   * 실패 확률 계산
   * - 설정 저장 시각(timerStart)을 기준으로
   * - 시간이 지날수록 실패 확률 증가
   */
  const rate = req.session.failRate || { min: 0, max: 20 };
  let failRate = rate.min;

  if (req.session.timerStart) {
    const elapsed = (Date.now() - req.session.timerStart) / 1000;
    const ratio = Math.min(elapsed / 3600, 1); // 최대 1시간
    failRate = rate.min + (rate.max - rate.min) * ratio;
  }

  // 확률적 실패
  if (Math.random() * 100 < failRate) {
    return res.json({
      success: false,
      message: "해당 과목은 정원이 가득 찼습니다.",
    });
  }

  /**
   * 수강신청 성공
   * - status = 2 (신청 완료)
   */
  await pool.query(
    "UPDATE courses SET status=2 WHERE id=? AND user_id=?",
    [courseId, userId]
  );

  const [[course]] = await pool.query(
    "SELECT * FROM courses WHERE id=?",
    [courseId]
  );

  res.json({
    success: true,
    course,
  });
};

/**
 * 수강신청 내역 삭제
 * - status=2: DB에서 완전 삭제
 * - status=1: 자동신청 완료 과목이기에, DB 삭제x
 */
exports.deleteAppliedCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;

  const [[course]] = await pool.query(
    "SELECT course_name, credit, status FROM courses WHERE id=? AND user_id=?",
    [courseId, userId]
  );

  if (!course) {
    return res.json({ success: false });
  }

  // 신청 완료 과목은 DB에서 삭제
  if (course.status === 2) {
    await pool.query(
      "DELETE FROM courses WHERE id=? AND user_id=?",
      [courseId, userId]
    );
  }

  res.json({
    success: true,
    course,
  });
};
