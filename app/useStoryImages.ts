"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StorySegment } from "@/lib/story/schema";
import { drawingScenePrompt } from "@/lib/image/story-image";

export interface SceneImage {
  url?: string;
  loading: boolean;
  error?: string;
  backgroundSource?: string;
}

// 화면과 분리된 이미지 진행. 실패하거나 늦어져도 동화·선택·낭독을 막지 않는다.
export function useStoryImages() {
  const [images, setImages] = useState<SceneImage[]>([]);
  const drawing = useRef<File | null>(null);
  const epoch = useRef(0);
  const controller = useRef(new AbortController());
  const urls = useRef<string[]>([]);
  const reference = useRef<File | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const count = useRef(0);

  const clearImages = useCallback(() => {
    epoch.current++;
    controller.current.abort();
    controller.current = new AbortController();
    urls.current.forEach(url => URL.revokeObjectURL(url));
    urls.current = [];
    reference.current = null;
    queue.current = Promise.resolve();
    count.current = 0;
    setImages([]);
  }, []);

  useEffect(() => () => {
    epoch.current++;
    controller.current.abort();
    urls.current.forEach(url => URL.revokeObjectURL(url));
  }, []);

  const setDrawing = useCallback((file: File | null) => { drawing.current = file; }, []);
  const hasDrawing = useCallback(() => !!drawing.current, []);

  const appendImages = useCallback((segment: StorySegment, protagonist?: string) => {
    const version = epoch.current;
    const signal = controller.current.signal;
    const original = drawing.current;
    const offset = count.current;
    count.current += segment.scenes.length;
    setImages(previous => [...previous, ...segment.scenes.map(() => ({ loading: true }))]);

    queue.current = queue.current.then(async () => {
      for (const [i, scene] of segment.scenes.entries()) {
        if (signal.aborted || version !== epoch.current) return;
        const update = (value: SceneImage) => {
          if (version === epoch.current) setImages(previous => previous.map((item, index) => index === offset + i ? value : item));
        };
        try {
          const form = new FormData();
          form.set("mode", original ? "drawing-scene" : reference.current ? "scene" : "text");
          form.set("prompt", original ? drawingScenePrompt(scene.imagePrompt, "", scene.text) : [
            "One soft watercolor storybook illustration, no text or speech bubbles.",
            `Fixed character appearance: ${segment.characterBible || protagonist || "a small friendly storybook animal"}`,
            `Depict exactly this moment: ${scene.imagePrompt}`,
            `Narration: ${scene.text}`,
            "Keep the same character design as the reference image if supplied.",
          ].join("\n"));
          if (original) form.set("image_0", original);
          else if (reference.current) form.set("image_0", reference.current);
          const response = await fetch("/api/image", { method: "POST", body: form, signal });
          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || "삽화를 만들지 못했어요.");
          }
          const blob = await response.blob();
          if (signal.aborted || version !== epoch.current) return;
          if (!blob.type.startsWith("image/")) throw new Error("삽화 응답 형식이 올바르지 않아요.");
          if (!original && !reference.current) reference.current = new File([blob], "character-reference.png", { type: blob.type });
          const url = URL.createObjectURL(blob);
          urls.current.push(url);
          update({ url, loading: false, backgroundSource: response.headers.get("x-background-source") || "generated" });
        } catch (error) {
          if (signal.aborted || version !== epoch.current) return;
          update({ loading: false, error: error instanceof Error ? error.message : "삽화를 만들지 못했어요." });
        }
      }
    });
  }, []);

  return { images, appendImages, clearImages, setDrawing, hasDrawing };
}
