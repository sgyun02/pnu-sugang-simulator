/**
 * sessionTimer.js
 *
 * 로그인 세션의 남은 시간을 화면에 표시하고,
 * 세션이 만료되면 자동으로 로그아웃 처리한다.
 *
 * - 서버에서 전달된 SESSION_LOGIN_AT(로그인 시각)를 기준으로
 *   클라이언트에서 남은 시간을 계산한다.
 * - 1초마다 타이머를 갱신하여 상단 헤더에 표시한다.
 * - 남은 시간이 0이 되면 사용자에게 알림을 띄운 후 로그아웃한다.
 *
 * ⚠ 즉시 실행 함수(IIFE) 형태로 작성하여
 *   전역 네임스페이스 오염을 방지한다.
 */

(function () {
  /**
   * 서버에서 로그인 시각이 전달되지 않은 경우
   * 타이머를 실행하지 않는다.
   */
  if (!window.SESSION_LOGIN_AT) return;

  /**
   * 세션 총 유지 시간(30분)에서
   * 로그인 이후 경과한 시간을 빼서
   * 남은 시간을 초 단위로 계산한다.
   */
  let remain =
    30 * 60 -
    Math.floor((Date.now() - window.SESSION_LOGIN_AT) / 1000);

  /**
   * 세션 타이머를 갱신하는 함수
   * - 남은 시간을 mm:ss 형식으로 변환하여 화면에 출력
   * - 세션 만료 시 자동 로그아웃 처리
   */
  function updateTimer() {
    const el = document.getElementById("sessionTimer");
    if (!el) return;

    const m = Math.floor(remain / 60);
    const s = remain % 60;

    // 남은 시간 표시 (MM:SS)
    el.innerText =
      `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    /**
     * 세션 만료 처리
     * - 알림 표시
     * - 로그아웃 요청으로 세션 종료
     */
    if (remain <= 0) {
      alert("세션이 만료되었습니다.");
      location.href = "/logout";
      return; // 이후 코드 실행 방지
    }

    // 다음 초를 위해 남은 시간 감소
    remain--;
  }

  // 최초 1회 즉시 실행
  updateTimer();

  // 1초마다 타이머 갱신
  setInterval(updateTimer, 1000);
})();
