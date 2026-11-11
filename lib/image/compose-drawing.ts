import sharp from "sharp";
import { removeExteriorPaper } from "./drawing-cutout";

export async function prepareDrawing(drawing: File) {
  const source = await sharp(Buffer.from(await drawing.arrayBuffer()), { limitInputPixels: 25_000_000 })
    .rotate().resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true }).toColourspace("srgb").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = removeExteriorPaper(new Uint8ClampedArray(source.data), source.info.width, source.info.height);
  let left = source.info.width; let top = source.info.height; let right = -1; let bottom = -1;
  for (let y = 0; y < source.info.height; y++) for (let x = 0; x < source.info.width; x++) {
    if (!pixels[(y * source.info.width + x) * 4 + 3]) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error("DRAWING_EMPTY");
  return sharp(Buffer.from(pixels), { raw: { width: source.info.width, height: source.info.height, channels: 4 } })
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 }).png().toBuffer();
}

// Model reference: the cut-out character centred on plain white paper.
export async function drawingReference(prepared: Buffer) {
  const character = await sharp(prepared).resize({ width: 420, height: 420, fit: "inside" }).png().toBuffer({ resolveWithObject: true });
  return sharp({ create: { width: 512, height: 512, channels: 3, background: "#ffffff" } })
    .composite([{ input: character.data, left: Math.round((512 - character.info.width) / 2), top: Math.round((512 - character.info.height) / 2) }])
    .png().toBuffer();
}

export async function composeDrawing(background: Buffer, drawing: File | Buffer, scale = 1) {
  const prepared = Buffer.isBuffer(drawing) ? drawing : await prepareDrawing(drawing);
  const scene = await sharp(background).rotate().png().toBuffer({ resolveWithObject: true });
  const width = scene.info.width; const height = scene.info.height;
  const safeScale = Number.isFinite(scale) ? Math.min(1.5, Math.max(0.5, scale)) : 1;
  const character = await sharp(prepared)
    .resize({ width: Math.round(width * .40 * safeScale), height: Math.round(height * .52 * safeScale), fit: "inside" })
    .png().toBuffer({ resolveWithObject: true });
  const x = Math.max(0, Math.round(width * .35 - character.info.width / 2));
  const y = Math.max(0, Math.round(height * .85 - character.info.height));
  return sharp(scene.data).composite([{ input: character.data, left: x, top: y }]).png().toBuffer();
}
