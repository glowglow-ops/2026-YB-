/**
 * 사이트 설정
 * ------------------------------------------------------------
 * GITHUB_REPO: "GitHub아이디/저장소이름" 형식으로 입력하세요.
 * 예) 이 저장소를 "yonsei-whawoo/2026-yb-exhibition" 으로 만들었다면
 *     GITHUB_REPO = "yonsei-whawoo/2026-yb-exhibition"
 *
 * 이 값을 정확히 넣어두면, 아래 두 폴더에 사진 파일만 추가로
 * 업로드해도(코드 수정 없이) 사이트에 자동으로 반영됩니다.
 *   - assets/img/party   (파티 & 사람들)
 *   - assets/img/scenes  (전시 현장)
 *
 * 아직 GitHub 저장소를 만들지 않았다면 빈 문자열("")로 두세요.
 * 이 경우 assets/data/party-manifest.json 과
 * assets/data/scenes-manifest.json 에 적어둔 목록으로 대신 표시됩니다.
 * ------------------------------------------------------------
 */
window.SITE_CONFIG = {
  GITHUB_REPO: "",           // 예: "yourname/whawoo-2026-archive"
  GITHUB_BRANCH: "main",     // 기본 브랜치명 (main 또는 master)
  PARTY_FOLDER: "assets/img/party",
  SCENES_FOLDER: "assets/img/scenes",
};
