import { FONT_CLASS, type FontSize } from "@/lib/settings";
import { storyParagraphs } from "@/lib/story/paragraphs";
import type { ReactNode, Ref } from "react";

export default function StoryText({ text, fontSize, textRef, actions }: { text: string; fontSize: FontSize; textRef?: Ref<HTMLDivElement>; actions?: ReactNode }) {
  const paragraphs = storyParagraphs(text);
  return (
    <div ref={textRef} className={`reader-text story min-w-0 space-y-[0.9em] text-left text-ink [overflow-wrap:anywhere] ${FONT_CLASS[fontSize]}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="flow-root whitespace-pre-line">
          {paragraph}
          {index === paragraphs.length - 1 && actions}
        </p>
      ))}
    </div>
  );
}
