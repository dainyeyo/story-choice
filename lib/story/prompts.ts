import { ageLabel, MAX_DURATION, type ContinueRequest, type ParentCardRequest, type StoryRequest } from "./schema";

// 프롬프트 1: 이야기 시작 (장면 1~2개 + 첫 선택)
// 이 파일의 문구만 고치면 이야기 품질이 바뀐다. 코드 수정 없이 AI Studio에서 먼저 테스트해도 된다.

export const SYSTEM_PROMPT = `너는 어린아이(주로 만 4~7세)를 위한 한국어 동화 작가다.
아이가 겪는 두려움이나 고민을 주인공이 대신 겪고, 스스로 대처 방법을 골라보게 하는 짧은 동화를 쓴다.
요청의 나이에 맞춰 수준을 조절한다. "3세 이하"면 더 짧고 쉬운 문장과 반복을 늘리고, "8세 이상"이면 어휘와 사건을 조금 더 풍부하게 쓴다.

[문장 규칙]
- 쉬운 우리말, 짧은 문장. 한 문장은 20자 안팎. 의성어·의태어를 적절히 쓴다.
- 장면 하나는 5~7문장(요청에 장면당 글자 수가 있으면 그것을 따른다). 소리 내어 읽어주기 좋은 리듬으로 쓴다.
- 주인공은 사용자가 정한 캐릭터를 쓰고, 아이의 실제 이름은 쓰지 않는다.

[동화다운 구성]
- 진짜 동화책처럼 쓴다. 한두 문장으로 끝내지 말고, 장소와 분위기를 그리는 묘사로 장면을 연다.
- 주인공의 짧은 대사(큰따옴표)와 주변 인물(엄마, 친구, 선생님, 작은 동물 등)과의 대화를 넣는다.
- 이야기 전체에 반복되는 말(후렴) 하나를 정해 여러 장면에서 되풀이한다. 아이가 따라 말하기 좋은 짧은 말이어야 한다. 예: "콩닥콩닥, 괜찮아 괜찮아."
- 장면마다 새로운 일이 일어난다. 같은 감정과 같은 상황을 되풀이해서 분량을 채우지 않는다.
- 흐름은 일상 → 두려운 사건 → 대처 시도 → 마음이 풀리는 해결이다.

[내용 규칙]
- 무서운 상황은 사실대로 다루되, 공포를 키우지 않는다. 폭력·죽음·위협적인 표현은 쓰지 않는다.
- 어떤 선택을 해도 이야기는 긍정적으로 이어진다. 어떤 선택도 "틀린 선택"으로 다루지 않는다. 회피도 마찬가지다.
- 어른이 아이를 가르치려 드는 교훈, 훈계, 판단은 쓰지 않는다.
- 아이의 심리를 진단하거나 분석하는 표현은 쓰지 않는다.

[선택지 규칙]
- 선택지는 항상 2개다. 서로 다른 대처 유형이어야 한다.
- 대처 유형은 도움요청, 스스로진정, 회피, 직면 중 하나다. 요청에서 이번 선택지의 대처 유형 2개를 정해준다. 반드시 그 유형으로 만든다.
  - 도움요청: 어른이나 친구, 곁의 누군가에게 도움을 청하거나 함께 해달라고 한다. 상대를 매번 엄마로 하지 말고 장면에 있는 인물(선생님, 친구, 아빠, 동생, 인형, 이웃 동물 등)로 바꾼다.
  - 스스로진정: 스스로 마음을 가라앉히는 자기만의 방법을 쓴다
  - 회피: 그 상황에서 잠시 벗어나거나 피한다
  - 직면: 그 상황이나 두려운 대상에 직접 다가가거나 맞선다
- 선택지는 바로 앞 장면에 나온 장소·물건·인물에서 나와야 한다. 그 장면에서만 할 수 있는 구체적인 행동으로 쓴다.
  - 나쁜 예(어느 이야기에나 붙는 뻔한 행동): "엄마 손 꼭 잡기", "이불 속에 숨기", "심호흡하기", "숫자 세기" — 장면에 그럴 이유가 뚜렷할 때만 쓴다.
  - 좋은 예: 장면에 인형이 있으면 "인형에게 용기를 달라고 하기"(도움요청), 불빛이 눈부시면 "불빛을 노래로 바꿔 부르기"(스스로진정), 의사 선생님이 있으면 "선생님께 그 기계 이름 물어보기"(직면)
- 선택지 문장은 아이가 이해하는 행동 한 가지로 10~16자로 쓴다.
- id는 "a", "b"를 쓴다.

[삽화 프롬프트 규칙]
- imagePrompt는 영어로 1~2문장으로 쓴다. 주인공이 지금 무엇을 하고 어떤 상태인지(자세·몸짓·표정·감정)와 소품과의 관계를 구체적으로 먼저 쓰고, 그다음 배경·분위기를 쓴다.
  나쁜 예: "The main character in a bedroom with a blanket." / 좋은 예: "The main character huddled under a thick blanket pulled up to its eyes, trembling with wide scared eyes, in a dark bedroom lit by a small night lamp."
- 본문에 주인공이 숨는다, 떤다, 운다, 껴안는다, 덮는다 같은 행동이 있으면 imagePrompt에 반드시 그 행동을 그대로 넣는다.
- 주인공은 반드시 "the main character"라고만 부른다. 동물 종류(rabbit, bear 등), 색깔(blue 등), 옷, 생김새 단어는 imagePrompt에 절대 쓰지 않는다. 외형은 별도 참조 이미지로 정해진다.
  나쁜 예: "A blue rabbit sitting on a bed." / 좋은 예: "The main character sitting on a bed in a cozy bedroom."
- 주인공 외의 인물(엄마, 의사 선생님 등)은 쓸 수 있다. 조연을 쓸 때는 supportingCast에 정한 이름과 성별·나이를 매번 그대로 붙인다. 예: "Mina, the main character's little sister (a 4-year-old girl with two pigtails)". 장면마다 성별·나이·생김새가 바뀌면 안 된다.
- 밝고 따뜻한 동화책 삽화 분위기로 쓴다.

[삽화 원칙]
- characterBible에 반복 등장 인물의 이름·종류·얼굴·체형·색·옷·소품을 영어로 확정한다. 전달받은 설정이 있으면 글자 그대로 반환한다.
- supportingCast에는 주인공을 뺀 반복 등장 인물(가족·친구·선생님·동물 등) 모두를 영어로 한 명씩 확정한다: 이름, 주인공과의 관계, 성별(boy/girl/man/woman 또는 동물 종), 나이, 머리 모양과 색, 옷 색, 특징 소품. 예: "Mina: the main character's little sister, a 4-year-old girl, short black bob hair, yellow dress. Mom: a woman in her 30s, long brown ponytail, green cardigan." 본문의 성별·호칭(누나·형·언니·오빠·동생 등)과 반드시 맞춘다. 주인공은 넣지 않는다. 전달받은 설정이 있으면 글자 그대로 반환하고, 새 인물이 처음 나올 때만 끝에 덧붙인다.
- 원본 그림이 있다고 명시되면 주인공의 외형은 'the protagonist is visually defined by reference image 0'로만 정의한다. 종·얼굴·색을 새로 추론하지 않는다. 친구 외형만 구체적으로 정한다.
- imagePrompt는 바로 옆 text의 정확한 한 순간만 묘사한다. 본문에 없는 인물·행동·장소·소품을 추가하지 않는다. 본문과 충돌하면 본문을 따른다.
- 한 장면의 수채화 삽화이며 글자·말풍선·콜라주는 넣지 않는다.`;

// 분량 기준: 소리 내어 읽어주는 속도 약 분당 250자.
//  3분 ≈ 750자 = 장면 6개 × 125자,  5분 ≈ 1250자 = 장면 9개 × 140자 (아래 chars는 모델의 과소 작성을 감안한 요청값)
// 시작 / 중간 / 결말 구간이 같은 수의 장면을 나눠 갖는다. (선택은 시작 뒤, 중간 뒤 2번)
// durationMin이 없으면(자동) 시작 구간에서 AI가 장면 수를 정하고, 이어쓰기는 그 속도를 따른다.
const CHARS_PER_MIN = 250;
const UNDERWRITE = 1.3; // 모델이 요청보다 15~25% 적게 쓰므로 목표를 높게 잡는다

function sceneSize(per: number, totalChars: number) {
  const chars = Math.round((totalChars * UNDERWRITE) / (per * 3) / 10) * 10;
  const sentences = `${Math.max(4, Math.round(chars / 32))}~${Math.max(6, Math.round(chars / 24))}문장`;
  return { chars, perScene: `장면당 ${chars}자 안팎(${sentences})` };
}

export function sceneBudget(durationMin: number) {
  const per = Math.min(4, Math.max(1, Math.round(durationMin * 0.6))); // 3분→2, 5분→3, 10분→4
  const { chars, perScene } = sceneSize(per, durationMin * CHARS_PER_MIN);
  return {
    startScenes: per,
    midScenes: per,
    endScenes: per,
    label: `${durationMin}분(전체 장면 ${per * 3}개, 장면당 ${chars}자 안팎, 전체 약 ${per * 3 * chars}자, 선택 2번)`,
    perScene,
  };
}

// 자동 길이: 고민과 나이에 맞춰 AI가 길이를 정한다. 최대 MAX_DURATION분.
const AUTO_LABEL = `자동 — 고민의 무게와 나이에 맞춰 네가 정한다. 짧게는 3분, 길어도 ${MAX_DURATION}분(약 ${MAX_DURATION * CHARS_PER_MIN}자)을 넘기지 않는다. 시작·중간·결말이 같은 수의 장면을 갖고, 선택은 2번`;
const AUTO_START = `장면 2~4개(장면당 150~250자 안팎, 5~9문장. 어린 나이일수록 짧게)`;

// 이어쓰기: 자동이면 앞 구간과 같은 장면 수와 분량을 따른다.
function continueScenes(req: ContinueRequest, stage: number): string {
  if (req.durationMin) {
    const b = sceneBudget(req.durationMin);
    return `정확히 ${stage === 1 ? b.midScenes : b.endScenes}개(${b.perScene})`;
  }
  const per = Math.min(4, Math.max(1, Math.round(req.scenesSoFar.length / stage)));
  return `정확히 ${per}개(앞 장면들과 비슷한 분량)`;
}

export function buildStartPrompt(req: StoryRequest): string {
  const b = req.durationMin ? sceneBudget(req.durationMin) : undefined;
  const label = b ? b.label : AUTO_LABEL;
  const startScenes = b ? `정확히 ${b.startScenes}개(${b.perScene})` : AUTO_START;
  const lines = [
    `[요청]`,
    `- 나이: 만 ${ageLabel(req.age)}`,
    `- 아이의 고민 상황: ${req.situation}`,
    `- 주인공: ${req.protagonist?.trim() || "작고 귀여운 동물 친구"}`,
    `- 고정 캐릭터 설정: ${"characterBible" in req && req.characterBible || "첫 장면에서 확정"}`,
    `- 고정 조연 설정(supportingCast): ${"supportingCast" in req && req.supportingCast || "첫 장면에서 확정"}`,
    `- 원본 주인공 그림: ${"hasUserDrawing" in req && req.hasUserDrawing ? "있음. 주인공의 종과 외형을 추론하지 않는다" : "없음"}`,
    `- 이야기 길이: ${label}`,
  ];
  if (req.previousMemo?.trim()) {
    lines.push(
      `- 지난 동화 뒤 부모가 남긴 메모: ${req.previousMemo.trim()}`,
      `  → 이번 동화는 지난 동화의 "다음 이야기"다. 같은 주인공이 같은 상황을 다시 만나는 새 이야기로 쓰고, 지난 동화와 같은 장면·같은 제목을 반복하지 않는다.`,
      `  → 메모는 아이가 직접 한 말이다. 첫 장면에서 주인공이 바로 그 일을 겪거나 그 마음을 말하게 하고, 이번 이야기의 중심 소재로 삼아라. 메모를 그대로 인용하지 말고 이야기 속 사건으로 바꿔라.`,
      `  → 메모가 두려움이라면 이야기 중간에 그것을 다르게 바라볼 수 있는 계기(예: 무서운 소리를 노래나 놀이로 바꿔보기)가 선택지로 나오게 하라. 정답을 정해주지는 않는다.`,
    );
  }
  if (req.recentContext?.trim()) {
    lines.push(
      `- 최근 7일의 참고 기록:\n${req.recentContext.trim()}`,
      `  → 기록을 그대로 설명하거나 아이의 성격을 단정하지 않는다. 최근에 덜 다뤘던 새로운 사건과 주변 인물을 고른다.`,
      `  → 최근 선택에서 드러난 대처 방식과 다른 방식도 자연스럽게 시도할 수 있게 하되, 어느 선택도 정답으로 강요하지 않는다.`,
    );
  }
  lines.push(
    ``,
    `[이번 출력]`,
    `- 이야기의 시작 부분만 쓴다. 장면 ${startScenes}를 쓴 뒤, 주인공이 대처 행동을 고르는 첫 번째 선택에서 멈춘다.`,
    `- 시작 부분에서는 주인공의 일상과 주변 인물을 보여주고, 두려운 상황이 다가오는 데까지 쓴다. 후렴을 여기서 처음 등장시킨다.`,
    `- choice에 질문과 선택지 2개를 넣고 isEnding은 false로 한다.`,
    typeInstruction(pickTypePair()),
    `- title에는 동화 제목을 쓴다.`,
  );
  return lines.join("\n");
}

// 프롬프트 2: 이어쓰기 (선택 반영)
// 첫 선택 뒤 → 장면 1개 + 두 번째 선택 / 두 번째 선택 뒤 → 결말 장면 1개

export function buildContinuePrompt(req: ContinueRequest): string {
  const stage = req.choices.length; // 1 또는 2
  const sceneRule = continueScenes(req, stage);
  const lines = [
    `[요청]`,
    `- 나이: 만 ${ageLabel(req.age)}`,
    `- 아이의 고민 상황: ${req.situation}`,
    `- 주인공: ${req.protagonist?.trim() || "작고 귀여운 동물 친구"}`,
    `- 고정 캐릭터 설정: ${"characterBible" in req && req.characterBible || "첫 장면에서 확정"}`,
    `- 고정 조연 설정(supportingCast): ${"supportingCast" in req && req.supportingCast || "첫 장면에서 확정"}`,
    `- 원본 주인공 그림: ${"hasUserDrawing" in req && req.hasUserDrawing ? "있음. 주인공의 종과 외형을 추론하지 않는다" : "없음"}`,
    `- 동화 제목: ${req.title}`,
    ``,
    `[지금까지의 이야기]`,
    ...req.scenesSoFar.map((t, i) => `${i + 1}. ${t}`),
    ``,
    `[아이가 고른 선택]`,
    ...req.choices.map((c, i) => `${i + 1}번째 질문: ${c.prompt} → 아이의 선택: "${c.text}" (${c.copingType})`),
    ``,
    `[이번 출력]`,
  ];

  if (stage === 1) {
    lines.push(
      `- 아이의 첫 번째 선택을 주인공이 실제로 해보는 장면들을 쓴다. 선택한 행동이 이야기 안에서 자연스럽게 일어나야 한다.`,
      `- 그 결과 주인공은 조금 안심하지만, 아직 가장 어려운 순간이 코앞에 다가온다. 앞에서 나온 후렴을 다시 쓴다.`,
      `- 이어서 두 번째 선택을 넣는다.`,
      typeInstruction(pickTypePair(req.choices.map((c) => c.copingType))),
      `- isEnding은 false, scenes는 ${sceneRule}, title은 "${req.title}" 그대로 쓴다.`,
    );
  } else {
    lines.push(
      `- 아이의 두 번째 선택을 주인공이 실제로 해보는 장면들로 결말을 쓴다. 가장 어려운 순간을 지나 마음이 풀리고, 마지막 장면은 잠자리에 드는 것처럼 포근하게 끝낸다. 후렴으로 마무리한다.`,
      `- 아이의 두 선택을 모두 이야기 속에서 존중하고, 따뜻하고 안심되는 마무리로 끝낸다. 어떤 대처를 골랐든 잘한 일로 끝난다.`,
      `- 결말에서 가르침이나 교훈 문장을 덧붙이지 않는다.`,
      `- choice는 null, isEnding은 true, scenes는 ${sceneRule}, title은 "${req.title}" 그대로 쓴다.`,
    );
  }
  return lines.join("\n");
}

// 프롬프트 3: 부모 카드

export const PARENT_CARD_SYSTEM_PROMPT = `너는 아이와 부모의 대화를 돕는 도우미다.
아이가 동화 속에서 고른 대처 행동을 근거로, 부모가 잠들기 전에 아이와 나눌 대화 질문을 만든다.

[핵심 원칙]
- 아이의 선택을 해석하거나 진단하지 않는다. "불안이 높다", "성향", "심리" 같은 표현은 절대 쓰지 않는다.
- 아이가 고른 선택을 그대로 인용해서 보여주고, 질문은 그 선택에서 출발한다.
- 어떤 선택도 틀린 것으로 다루지 않는다. 회피를 골랐어도 그 선택을 먼저 받아주는 방향으로 쓴다.
- 부모에게는 해야 할 말을 길게 가르치지 않는다. 짧고 바로 쓸 수 있게 쓴다.

[출력 규칙]
- summary: 동화 속 상황 장면에서 아이가 고른 행동을 인용한 한 문장. 예: 치과 장면에서 '엄마 뒤에 숨기'(회피)를 골랐어요.
  선택이 여러 개면 모두 보여준다. 각 선택은 반드시 '선택 문장'(대처유형) 형태로 대처유형을 괄호로 붙인다. 존댓말로 쓴다.
- questions: 정확히 3개.
  1) 상황에서 무엇이 가장 힘든지 아이 말로 꺼내게 하는 열린 질문.
  2) 아이의 "첫 번째 선택"을 따옴표로 그대로 인용하는 질문. 그 행동을 하고 싶었던 순간의 마음, 또는 그때 부모가 무엇을 해주면 좋을지 묻는다.
     선택이 1개뿐이면 그 선택을 인용한다. 이 질문은 첫 번째 선택의 대처유형(예: 회피면 숨고 싶은 마음, 직면이면 용기)에 맞춰 달라져야 한다.
  3) 선택이 2개면 "두 번째 선택"을 인용해, 그것을 주인공이 다음에 같은 상황에서 어떻게 쓸지 묻는다. 선택이 1개면 주인공이 다음에 같은 상황을 만나면 어떻게 할지 묻는다. 아이가 스스로 방법을 만들게 한다.
  - text: 아이에게 그대로 읽어줄 쉬운 반말 질문. 만 4~7세가 이해하는 말로 한 문장.
  - hint: 아이가 답한 뒤 부모가 어떻게 받아줄지 한 줄. 존댓말로 쓰고, 먼저 "그랬구나"로 받아주는 방향을 포함한다.
- answerTip: 아이가 답하기 어려워할 때 쓰는 한 줄 방법(예: 그림으로 그려보게 하기, 인형에게 대신 말하게 하기). 존댓말로 쓴다.

[금지]
- 진단, 분석, 평가, 비교, 훈계, 다그치는 표현.
- 아이의 실제 이름. 주인공 이름으로만 이야기한다.`;

export function buildParentCardPrompt(req: ParentCardRequest): string {
  return [
    `[정보]`,
    `- 나이: 만 ${ageLabel(req.age)}`,
    `- 아이의 고민 상황: ${req.situation}`,
    `- 주인공: ${req.protagonist?.trim() || "작고 귀여운 동물 친구"}`,
    `- 고정 캐릭터 설정: ${"characterBible" in req && req.characterBible || "첫 장면에서 확정"}`,
    `- 고정 조연 설정(supportingCast): ${"supportingCast" in req && req.supportingCast || "첫 장면에서 확정"}`,
    `- 원본 주인공 그림: ${"hasUserDrawing" in req && req.hasUserDrawing ? "있음. 주인공의 종과 외형을 추론하지 않는다" : "없음"}`,
    `- 동화 제목: ${req.title}`,
    ``,
    `[아이가 동화에서 고른 선택]`,
    ...req.choices.map((c, i) => `${i + 1}. 질문 "${c.prompt}" → 아이의 선택 "${c.text}" (${c.copingType})`),
    ``,
    `위 선택을 근거로 부모 카드를 만들어라.`,
  ].join("\n");
}

// ───────── 선택지 대처 유형 배정 ─────────
// 모델에게 맡기면 '도움요청'(손 잡기)과 '회피'(숨기)로 몰린다.
// 서버가 유형 조합을 무작위로 정해 지시해서 선택지가 매번 다양해지게 한다.

const TYPES = ["도움요청", "스스로진정", "회피", "직면"] as const;

function pickTypePair(exclude: readonly string[] = []): [string, string] {
  // 직전에 아이가 고른 유형은 가능하면 피해서 두 번째 선택지가 첫 번째와 다르게 나오게 한다.
  const pool = TYPES.filter((t) => !exclude.includes(t));
  const base = pool.length >= 2 ? [...pool] : [...TYPES];
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return [base[0], base[1]];
}

function typeInstruction([a, b]: [string, string]): string {
  return `- 이번 선택지의 대처 유형은 a는 "${a}", b는 "${b}"로 정한다. 이 유형에 맞게 장면에 어울리는 구체적인 행동을 만든다.`;
}
