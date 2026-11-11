// Only use pixel analysis to find margins. Never remove or recolor drawing pixels.
export function drawingBounds(data: Uint8ClampedArray, width: number, height: number) {
  let left = width; let top = height; let right = -1; let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      if (data[offset + 3] < 24) continue;
      // Near-white paper is ignored for cropping only; white body parts stay intact.
      if (Math.min(data[offset], data[offset + 1], data[offset + 2]) >= 245) continue;
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  if (right < left || bottom < top) return { left: 0, top: 0, width, height };
  const padding = Math.max(12, Math.round(Math.max(right - left + 1, bottom - top + 1) * 0.14));
  left = Math.max(0, left - padding); top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding); bottom = Math.min(height - 1, bottom + padding);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

export function drawingScenePrompt(visualPrompt: string, _supportingCharacters: string, narration: string) {
  return [
    "Turn input image 0 into one storybook page. The character drawn in input image 0 IS the main character of this story, the hero of the scene.",
    "THERE IS EXACTLY ONE MAIN CHARACTER: the drawn character from input image 0, appearing once. Do not invent, add or substitute any other hero, child, kid, girl, boy, animal or creature as the main character, and do not draw a second copy of it.",
    "Keep the drawn character's look: same silhouette, shapes, face, colours, line style and marks, drawn like the child's original. Story names and animal words refer to this drawn character; never redraw it as a different animal or person.",
    "Act out the moment: change the drawn character's pose, body and facial expression to match exactly what it is doing and feeling right now, and let it physically interact with the props (for example, under a blanket pulled up to its eyes and trembling, hugging a toy, hiding behind a door, running, crying, smiling). The situation must be obvious at a glance, not the character just standing next to things.",
    `This moment: ${visualPrompt}`,
    `Story text of this page (the protagonist here is the drawn character): ${narration}`,
    // A free-form characterBible can contain a conflicting protagonist even when
    // labelled 'supporting only'. Never feed that unvalidated identity back here.
    "Other people or animals only if the moment names them, drawn smaller and clearly secondary. Soft watercolor storybook background, one scene, no text or speech bubbles.",
  ].join("\n");
}

export function sceneReferences<T>(drawing: T | null, previous: T | null, fallback: T | null): T[] {
  // A generated page is never an identity reference when an original drawing exists.
  return drawing ? [drawing] : previous ? [previous] : fallback ? [fallback] : [];
}

export function backgroundScenePrompt(visualPrompt: string, narration: string) {
  return [
    "Paint a soft watercolor storybook BACKGROUND PLATE. The protagonist will be composited separately by the app.",
    "Render only the location, scenery and scene props. Leave a clear, quiet foreground landing area in the center-left (15%-55% of image width, 33%-85% of image height). The protagonist will stand there.",
    "Do not render the protagonist, a substitute main character, a silhouette, or a picture of the protagonist. Supporting characters, if needed, are small and placed on the RIGHT side. Keep foreground objects from covering the reserved landing area. No letters or speech bubbles.",
    `Setting and prop context: ${visualPrompt}`,
    `Story context for the background only: ${narration}`,
    "Final reminder: environment plate only; center-left foreground stays free for the separately composited protagonist.",
  ].join("\n");
}
