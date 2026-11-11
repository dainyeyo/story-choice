# AI 정서 동화

아이의 고민을 동화로 겪게 하고, 아이가 고른 선택으로 부모와의 대화를 만들고, 그 대화가 다음 동화로 이어지는 서비스. (만 4~7세 · 모바일 우선 웹앱)

## 시작하기

1. Node.js LTS 설치 후 의존성 설치

```bash
npm install
```

2. 프로젝트 루트에 `.env.local` 파일을 만들고 Gemini 키를 넣는다. (이 파일은 깃에 올라가지 않는다. 키를 채팅이나 코드에 붙이지 말 것)

```
GEMINI_API_KEY=발급받은_키
```

3. 개발 서버 실행 후 http://localhost:3000 접속

```bash
npm run dev
```

배포(Vercel)에는 `.env.local`이 올라가지 않는다. Vercel 프로젝트의 Settings → Environment Variables에 `GEMINI_API_KEY`를 따로 넣어야 한다.

선택 환경변수: `GEMINI_MODEL` (기본 `gemini-3.5-flash-lite`). 기획안의 `gemini-2.5-flash`는 신규 사용자에게 막혀 있다. `gemini-3.8-flash`는 품질이 낫지만 수요가 몰리면 수십 초 걸린다.

## 구조

```
app/
  page.tsx                  → StoryApp을 렌더링할 뿐
  StoryApp.tsx              → 화면 전체 (입력 → 동화 → 선택 → 부모 카드 → 메모). 스타일 없음
  api/story/
    route.ts                → POST /api/story           이야기 시작
    continue/route.ts       → POST /api/story/continue  선택 반영 이어쓰기
    parent-card/route.ts    → POST /api/story/parent-card 부모 카드
lib/story/
  schema.ts                 → 모든 요청·응답 타입과 Gemini용 JSON 스키마  ← 가장 먼저 볼 파일
  prompts.ts                → 프롬프트 3종 (시작·이어쓰기·부모 카드). 문구만 고치면 품질이 바뀐다
  generate.ts               → Gemini 호출 (JSON 형식이 깨지면 1회 재시도)
  validate.ts               → 요청 본문 검증
```

## 동화 한 편의 흐름

서버는 상태를 저장하지 않는다. 화면이 지금까지의 장면과 아이의 선택을 들고 있다가 매 요청에 같이 보낸다.

| 순서 | 호출 | 받는 것 |
|---|---|---|
| 1 | `POST /api/story` | 장면 1~2개 + 첫 번째 선택 |
| 2 | 아이가 선택 → `POST /api/story/continue` (`choices` 1개) | 장면 1개 + 두 번째 선택 |
| 3 | 아이가 선택 → `POST /api/story/continue` (`choices` 2개) | 결말 장면 (`isEnding: true`, `choice: null`) |
| 4 | `POST /api/story/parent-card` | 부모 카드 |
| 5 | 부모가 메모 저장 → 다음 동화는 1번에 `previousMemo`를 넣어 호출 | 메모를 이어받은 새 동화 |

### 요청 예시

```jsonc
// POST /api/story
{ "age": 5, "situation": "치과가 무서워", "durationMin": 5, "protagonist": "파란 토끼", "previousMemo": "윙 소리가 무섭대요" }
// protagonist, previousMemo는 선택

// POST /api/story/continue  (1번 응답의 title, 장면 text들, 아이가 고른 선택을 그대로 보낸다)
{ "age": 5, "situation": "치과가 무서워", "durationMin": 5, "protagonist": "파란 토끼",
  "title": "치과에 간 날",
  "scenesSoFar": ["장면1 text", "장면2 text"],
  "choices": [{ "prompt": "어떻게 할까요?", "text": "엄마 손을 꼭 잡아요", "copingType": "도움요청" }] }

// POST /api/story/parent-card
{ "age": 5, "situation": "치과가 무서워", "protagonist": "파란 토끼", "title": "치과에 간 날",
  "choices": [ /* 아이가 고른 선택 전부 */ ] }
```

### 응답 형식

- 이야기 (`StorySegment`): `{ title, scenes: [{ text, imagePrompt }], choice: { prompt, options: [{ id, text, copingType }] } | null, isEnding }`
- 부모 카드 (`ParentCard`): `{ summary, questions: [{ text, hint }] (정확히 3개), answerTip }`
- `copingType`은 `도움요청` · `스스로진정` · `회피` · `직면` 중 하나다.
- 실패하면 `{ "error": "메시지" }`와 400(입력 오류) 또는 500을 돌려준다. 화면에 그대로 보여줘도 되는 문장이다.

## 담당별로 알아둘 것

**프론트**
- 화면은 `StoryApp.tsx` 한 파일이고 일부러 꾸미지 않았다. 스타일은 통째로 바꿔도 된다.
- 상태 흐름은 `step`(`form` / `loading` / `story` / `card`)으로 돈다. 바뀌면 안 되는 건 API에 보내는 값(`scenesSoFar`, `choices`)뿐이다.
- 선택을 누르면 1~4초 동안 `loading` 화면이 되어 기존 장면이 사라진다. 장면을 유지한 채 로딩을 표시하면 더 좋다.
- 메모는 브라우저 `localStorage`(`story-choice:lastMemo`)에 저장한다.
- 아직 없는 것: 삽화 표시, 낭독(TTS), 그림 업로드.

**이미지**
- 기획안의 이미지 생성은 Cloudflare Workers AI(FLUX.2 klein)다. Gemini 키로는 이미지를 만들 수 없다(무료 티어 없음).
- 각 장면의 `imagePrompt`는 영어 한 문장이고, 주인공을 항상 `the main character`로만 부른다. 주인공 외형은 캐릭터 참조 이미지로 정해지는 구조라서다.
- 그림 업로드 자리는 `StoryApp.tsx`의 "주인공" 입력칸이다.

**프롬프트**
- 문구는 `lib/story/prompts.ts`에 모여 있다. 지켜야 할 규칙: 어떤 선택도 틀린 선택으로 다루지 않는다(회피 포함), 훈계·진단·심리 분석 표현을 쓰지 않는다, 아이 이름을 받지 않는다.
- 수정 후에는 같은 입력으로 여러 번 돌려서 JSON 형식이 안 깨지는지 확인한다.

## 개발 명령

```bash
npm run dev     # 개발 서버
npm run lint    # 린트
npm run build   # 프로덕션 빌드 (푸시 전에 한 번 돌리면 안전하다)
```

이 프로젝트의 Next.js는 일반 버전과 다른 점이 있다. 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 문서를 확인할 것. ([AGENTS.md](AGENTS.md) 참고)

## 아직 안 된 것

- Vercel 배포본 동작 확인 (환경변수 포함)
- 휴대폰 폭에서의 화면 확인
- 삽화, 낭독, 그림 → 캐릭터 변환
