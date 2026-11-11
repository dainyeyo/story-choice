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
    "Edit the attached drawing (input image 0) into a storybook scene. The drawn figure itself is the main protagonist, not an example of a style or a prop.",
    "Preserve its original drawing style: copy its exact silhouette, stacked shapes, face placement, proportions, line color, and distinctive marks. Keep the figure's visible design, including its simple outline and unfilled areas. Adapt placement and expression gently while keeping that design recognizable.",
    "The protagonist's appearance comes only from the attached drawing. Story names and animal words in the scene are labels, not instructions to redesign it. Supporting characters are separate figures beside it.",
    `Scene: ${visualPrompt}`,
    `Story context (actions and setting only; the image defines the protagonist's appearance): ${narration}`,
    // A free-form characterBible can contain a conflicting protagonist even when
    // labelled 'supporting only'. Never feed that unvalidated identity back here.
    "Use a soft watercolor background around the original-style protagonist. One scene, no text or speech bubbles.",
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
