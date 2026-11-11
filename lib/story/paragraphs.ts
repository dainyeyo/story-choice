/** 원문은 그대로 두고, 줄바꿈 없는 장면만 두 문장씩 묶어 표시한다. */
export function storyParagraphs(text: string): string[] {
  const normalized = text.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];

  // 작가가 넣은 문단과 대사 줄바꿈을 우선한다.
  if (normalized.includes("\n")) {
    return normalized.split(/\n[\t ]*\n+/).map((paragraph) => paragraph.trim()).filter(Boolean);
  }
  if (typeof Intl.Segmenter !== "function") return [normalized];

  const paragraphs: string[] = [];
  const closingQuotes: string[] = [];
  const quotePairs: Record<string, string> = { "“": "”", "‘": "’", "「": "」", "『": "』" };
  let paragraph = "";
  let sentences = 0;

  for (const { segment } of new Intl.Segmenter("ko", { granularity: "sentence" }).segment(normalized)) {
    paragraph += segment;
    sentences += 1;

    for (const character of segment) {
      if (character === closingQuotes.at(-1)) closingQuotes.pop();
      else if (character === '"') closingQuotes.push('"');
      else if (quotePairs[character]) closingQuotes.push(quotePairs[character]);
    }

    // 여러 문장으로 된 대사는 따옴표 중간에서 나누지 않는다.
    if (sentences >= 2 && closingQuotes.length === 0) {
      paragraphs.push(paragraph.trim());
      paragraph = "";
      sentences = 0;
    }
  }

  if (paragraph.trim()) paragraphs.push(paragraph.trim());
  return paragraphs;
}
