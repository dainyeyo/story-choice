// 폴백 동화 미리 만들기.  사용법:
//   1) npm run dev 로 서버를 켠다 (.env.local의 GEMINI_API_KEY 필요)
//   2) node scripts/gen-fallback.mjs
// 프리셋 4개 × 7구간(시작 1 + 중간 2 + 결말 4)을 AI로 만들어 lib/story/fallback-data.json에 저장한다.
// 결과를 직접 읽어 보고, 마음에 안 드는 구간은 JSON을 손으로 고쳐도 된다.

import { writeFileSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const PRESETS = ["치과가 무서워", "어린이집 가기 싫어", "동생이 생겼어", "병원 주사가 무서워"];

async function post(path, body) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await fetch(`${BASE}/api/story${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (r.ok && !j.fallback) return j;
      console.log(`  재시도 ${attempt}: ${j.error ?? "폴백 응답"}`);
    } catch (e) {
      console.log(`  재시도 ${attempt}: ${e.message}`);
    }
    await new Promise((res) => setTimeout(res, 1500 * attempt));
  }
  throw new Error(`실패: ${path}`);
}

const pick = (seg, id) => {
  const o = seg.choice.options.find((x) => x.id === id);
  return { prompt: seg.choice.prompt, text: o.text, copingType: o.copingType };
};

async function genOne(situation) {
  const base = { age: 5, situation, durationMin: 5 };
  console.log(`[${situation}] 시작`);
  const start = await post("", base);
  const texts = (seg) => seg.scenes.map((s) => s.text);

  const mid = {};
  const end = {};
  for (const a of ["a", "b"]) {
    const c1 = pick(start, a);
    mid[a] = await post("/continue", { ...base, title: start.title, scenesSoFar: texts(start), choices: [c1] });
    for (const b of ["a", "b"]) {
      const c2 = pick(mid[a], b);
      end[a + b] = await post("/continue", {
        ...base,
        title: start.title,
        scenesSoFar: [...texts(start), ...texts(mid[a])],
        choices: [c1, c2],
      });
    }
  }
  console.log(`[${situation}] 완료: ${start.title}`);
  return [situation, { start, mid, end }];
}

const entries = [];
for (const s of PRESETS) entries.push(await genOne(s)); // 한 번에 하나씩 (연결 폭주 방지)
writeFileSync(new URL("../lib/story/fallback-data.json", import.meta.url), JSON.stringify(Object.fromEntries(entries), null, 2) + "\n");
console.log("lib/story/fallback-data.json 저장 완료");
