// Repair small outline gaps on a mask only; keep original strokes and colors.
function maskPass(mask: Uint8Array, width: number, height: number, radius: number, horizontal: boolean, dilate: boolean) {
  const output = new Uint8Array(mask.length);
  const length = horizontal ? width : height;
  const lines = horizontal ? height : width;
  const index = (line: number, pos: number) => horizontal ? line * width + pos : pos * width + line;
  for (let line = 0; line < lines; line++) {
    let count = 0;
    for (let pos = 0; pos < Math.min(length, radius); pos++) count += mask[index(line, pos)];
    for (let pos = 0; pos < length; pos++) {
      if (pos + radius < length) count += mask[index(line, pos + radius)];
      if (pos - radius - 1 >= 0) count -= mask[index(line, pos - radius - 1)];
      output[index(line, pos)] = Number(dilate ? count > 0 : count === radius * 2 + 1);
    }
  }
  return output;
}

export function removeExteriorPaper(data: Uint8ClampedArray, width: number, height: number) {
  const output = data.slice();
  const ink = new Uint8Array(width * height);
  for (let pixel = 0; pixel < ink.length; pixel++) {
    const offset = pixel * 4;
    ink[pixel] = Number(data[offset + 3] >= 24 && Math.min(data[offset], data[offset + 1], data[offset + 2]) < 245);
  }
  const radius = Math.max(1, Math.round(Math.max(width, height) * 0.025));
  let barrier = maskPass(ink, width, height, radius, true, true);
  barrier = maskPass(barrier, width, height, radius, false, true);
  barrier = maskPass(barrier, width, height, radius, true, false);
  barrier = maskPass(barrier, width, height, radius, false, false);
  const exterior = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0; let tail = 0;
  const visit = (pixel: number) => {
    if (exterior[pixel] || ink[pixel] || barrier[pixel]) return;
    exterior[pixel] = 1;
    queue[tail++] = pixel;
  };
  for (let x = 0; x < width; x++) { visit(x); visit((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { visit(y * width); visit(y * width + width - 1); }
  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % width; const y = Math.floor(pixel / width);
    if (x > 0) visit(pixel - 1);
    if (x + 1 < width) visit(pixel + 1);
    if (y > 0) visit(pixel - width);
    if (y + 1 < height) visit(pixel + width);
  }
  for (let pixel = 0; pixel < ink.length; pixel++) {
    const offset = pixel * 4;
    if (ink[pixel]) continue;
    if (exterior[pixel]) output[offset + 3] = 0;
    else output.set([255, 255, 255, 255], offset);
  }
  return output;
}
