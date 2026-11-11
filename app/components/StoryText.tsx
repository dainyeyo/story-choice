import { FONT_CLASS, type FontSize } from "@/lib/settings";
import { storyParagraphs } from "@/lib/story/paragraphs";
import type { Ref } from "react";

export default function StoryText({ text, fontSize, textRef }: { text: string; fontSize: FontSize; textRef?: Ref<HTMLDivElement> }) {
  return (
    <div ref={textRef} className={`reader-text story min-w-0 flex-1 space-y-[0.9em] text-left text-ink [overflow-wrap:anywhere] ${FONT_CLASS[fontSize]}`}>
      {storyParagraphs(text).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">{paragraph}</p>
      ))}
    </div>
  );
}
