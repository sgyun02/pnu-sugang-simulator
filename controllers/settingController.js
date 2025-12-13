/**
 * controllers/settingController.js
 *
 * 모의 수강신청 환경설정 관련 비즈니스 로직 담당
 * - 과목 CRUD
 * - 수강 가능 학점 설정
 * - 실패 확률 범위 설정
 * - 모의 수강신청 시작 시각 기록
 */

const pool = require("../config/db");

/**
 * 설정 페이지 렌더링
 * - 로그인 시점 기록
 * - 이전 수강신청 결과(status=2) 초기화
 * - 사용자 과목 목록 조회
 */
exports.renderSettingPage = async (req, res) => {
  const userId = req.user.id;

  // 로그인 시점 기록 (세션 타이머 기준)
  if (!req.session.loginAt) {
    req.session.loginAt = Date.now();
  }

  // 이전 수강신청 결과 초기화 (완료 -> 수강신청 전, 자동신청 성공은 그대로)
  const [reset] = await pool.query(
    "UPDATE courses SET status = 0 WHERE user_id=? AND status = 2",
    [userId]
  );

  // 과목 목록 조회
  const [courses] = await pool.query(
    "SELECT * FROM courses WHERE user_id=? ORDER BY order_no ASC",
    [userId]
  );

  res.render("setting", {
    user: req.user,
    courses,
    loginAt: req.session.loginAt,
  });
};

/**
 * 기존 과목 수정
 */
exports.updateCourse = async (req, res) => {
  const c = req.body;

  await pool.query(
    `UPDATE courses SET
     order_no=?, course_name=?, course_code=?, class_no=?,
     course_type=?, credit=?, professor=?, department=?,
     time_info=?, memo=?, status=?
     WHERE id=? AND user_id=?`,
    [
      c.order_no,
      c.course_name,
      c.course_code,
      c.class_no,
      c.course_type,
      c.credit,
      c.professor,
      c.department,
      c.time_info,
      c.memo,
      c.status,
      req.params.id,
      req.user.id,
    ]
  );

  res.json({ success: true });
};

/**
 * 새 과목 추가
 */
exports.createCourse = async (req, res) => {
  const c = req.body;

  await pool.query(
    `INSERT INTO courses
     (user_id, order_no, course_name, course_code, class_no,
      course_type, credit, professor, department,
      time_info, memo, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      req.user.id,
      c.order_no || 0,
      c.course_name || "웹응용프로그래밍",
      c.course_code || "CSE205",
      c.class_no || "059",
      c.course_type || "전공필수",
      c.credit || 3,
      c.professor || "김원석",
      c.department || "컴퓨터공학전공",
      c.time_info || "화/목 13:30-14:45",
      c.memo || "",
      c.status || 0,
    ]
  );

  res.json({ success: true });
};

/**
 * 과목 삭제
 * - 상태와 관계없이 DB에서 완전히 삭제
 */
exports.deleteCourse = async (req, res) => {
  await pool.query(
    "DELETE FROM courses WHERE id=? AND user_id=?",
    [req.params.id, req.user.id]
  );

  res.json({ success: true });
};

/**
 * 수강신청 환경 설정 저장
 * - 수강 가능 학점
 * - 실패 확률 범위
 * - 모의 수강신청 시작 시각 기록
 */
exports.saveEnvironment = async (req, res) => {
  const { max_credit, failRate } = req.body;

  // 수강 가능 학점 저장
  await pool.query(
    "UPDATE users SET max_credit=? WHERE id=?",
    [max_credit, req.user.id]
  );
  req.user.max_credit = max_credit;

  // 실패 확률 범위 설정 (min-max)
  if (failRate) {
    const [min, max] = failRate.split("-").map(Number);
    req.session.failRate = { min, max };
  }

  // 모의 수강신청 시작 시각 기록
  req.session.timerStart = Date.now();

  res.json({ success: true });
};
