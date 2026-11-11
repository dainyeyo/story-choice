// 화면의 고민 상황 프리셋. 폴백 동화(lib/story/fallback-data.json)가 이 문장들로 미리 만들어져 있다.
// 프리셋 문구를 바꾸면 폴백 데이터도 다시 만들어야 한다: node scripts/gen-fallback.mjs (README 참고)
export const PRESETS = ["병원이 무서워", "어린이집 가기 싫어", "동생이 생겼어"] as const;
