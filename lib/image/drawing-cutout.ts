// Binary sliding-window dilate/erode along one axis (used for gap-closing on masks).
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

const luma = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;

// Estimate the paper colour at every pixel. Photos of paper are grey, tinted and
// unevenly lit, so a fixed "near white" threshold leaves the paper in the cutout.
// The brightest 20% of each block is treated as paper, spread to neighbouring
// blocks (so big filled areas borrow paper from around them) and interpolated.
function estimatePaper(data: Uint8ClampedArray, width: number, height: number) {
  const block = Math.max(8, Math.round(Math.max(width, height) / 40));
  const bw = Math.ceil(width / block); const bh = Math.ceil(height / block);
  const grid = new Float32Array(bw * bh * 3);
  const hist = new Uint32Array(256);
  const sample = (offset: number) => data[offset + 3] < 24 ? [255, 255, 255] : [data[offset], data[offset + 1], data[offset + 2]];
  for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
    hist.fill(0);
    const x1 = Math.min(width, (bx + 1) * block); const y1 = Math.min(height, (by + 1) * block);
    let total = 0;
    for (let y = by * block; y < y1; y++) for (let x = bx * block; x < x1; x++) {
      const [r, g, b] = sample((y * width + x) * 4); hist[Math.round(luma(r, g, b))]++; total++;
    }
    let threshold = 255; let seen = 0;
    while (threshold > 0 && seen + hist[threshold] < total * 0.2) seen += hist[threshold--];
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = by * block; y < y1; y++) for (let x = bx * block; x < x1; x++) {
      const [pr, pg, pb] = sample((y * width + x) * 4);
      if (luma(pr, pg, pb) >= threshold) { r += pr; g += pg; b += pb; n++; }
    }
    grid.set([r / n, g / n, b / n], (by * bw + bx) * 3);
  }
  // Global paper reference from the outer frame of the picture.
  const frame: number[][] = [];
  const edge = Math.max(1, Math.round(Math.min(width, height) * 0.03));
  for (let y = 0; y < height; y += 2) for (let x = 0; x < width; x += 2) {
    if (x >= edge && x < width - edge && y >= edge && y < height - edge) continue;
    frame.push(sample((y * width + x) * 4));
  }
  frame.sort((a, b) => luma(a[0], a[1], a[2]) - luma(b[0], b[1], b[2]));
  const top = frame.slice(Math.floor(frame.length * 0.5));
  const global = [0, 1, 2].map((c) => top.reduce((sum, p) => sum + p[c], 0) / Math.max(1, top.length));
  const globalLuma = luma(global[0], global[1], global[2]);
  // Spread the brightest neighbour (2 blocks) and reject blocks far darker than paper.
  const spread = new Float32Array(grid.length);
  for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
    let best = -1; let bestLuma = -1;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const nx = bx + dx, ny = by + dy;
      if (nx < 0 || ny < 0 || nx >= bw || ny >= bh) continue;
      const i = (ny * bw + nx) * 3; const l = luma(grid[i], grid[i + 1], grid[i + 2]);
      if (l > bestLuma) { bestLuma = l; best = i; }
    }
    const target = (by * bw + bx) * 3;
    if (bestLuma < globalLuma * 0.8) spread.set(global, target);
    else spread.set([grid[best], grid[best + 1], grid[best + 2]], target);
  }
  const paper = new Float32Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    const gy = Math.min(bh - 1, Math.max(0, (y + 0.5) / block - 0.5));
    const y0 = Math.floor(gy); const y1 = Math.min(bh - 1, y0 + 1); const ty = gy - y0;
    for (let x = 0; x < width; x++) {
      const gx = Math.min(bw - 1, Math.max(0, (x + 0.5) / block - 0.5));
      const x0 = Math.floor(gx); const x1 = Math.min(bw - 1, x0 + 1); const tx = gx - x0;
      for (let c = 0; c < 3; c++) {
        const a = spread[(y0 * bw + x0) * 3 + c] * (1 - tx) + spread[(y0 * bw + x1) * 3 + c] * tx;
        const b = spread[(y1 * bw + x0) * 3 + c] * (1 - tx) + spread[(y1 * bw + x1) * 3 + c] * tx;
        paper[(y * width + x) * 3 + c] = Math.max(1, a * (1 - ty) + b * ty);
      }
    }
  }
  return paper;
}

// Label 4-connected components of a mask; returns labels and per-component stats.
function components(mask: Uint8Array, width: number, height: number) {
  const labels = new Int32Array(mask.length).fill(-1);
  const area: number[] = []; const touchesEdge: boolean[] = [];
  const queue = new Int32Array(mask.length);
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || labels[start] >= 0) continue;
    const id = area.length; let head = 0; let tail = 0; let count = 0; let edge = false;
    labels[start] = id; queue[tail++] = start;
    while (head < tail) {
      const pixel = queue[head++]; count++;
      const x = pixel % width; const y = (pixel - x) / width;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) edge = true;
      for (const next of [x > 0 ? pixel - 1 : -1, x + 1 < width ? pixel + 1 : -1, y > 0 ? pixel - width : -1, y + 1 < height ? pixel + width : -1]) {
        if (next < 0 || !mask[next] || labels[next] >= 0) continue;
        labels[next] = id; queue[tail++] = next;
      }
    }
    area.push(count); touchesEdge.push(edge);
  }
  return { labels, area, touchesEdge };
}

function floodExterior(barrier: Uint8Array, width: number, height: number) {
  const exterior = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0; let tail = 0;
  const visit = (pixel: number) => {
    if (exterior[pixel] || barrier[pixel]) return;
    exterior[pixel] = 1;
    queue[tail++] = pixel;
  };
  for (let x = 0; x < width; x++) { visit(x); visit((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { visit(y * width); visit(y * width + width - 1); }
  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % width;
    if (x > 0) visit(pixel - 1);
    if (x + 1 < width) visit(pixel + 1);
    if (pixel >= width) visit(pixel - width);
    if (pixel + width < barrier.length) visit(pixel + width);
  }
  return exterior;
}

/**
 * Cut the drawn character out of its paper.
 * - Paper outside the character becomes transparent (even grey/tinted photo paper).
 * - Empty space inside the character's outline becomes solid white.
 * - Stray specks and things cut off by the picture edge (table, shadows) are dropped.
 * - Ink colours are white-balanced against the local paper colour.
 */
export function removeExteriorPaper(data: Uint8ClampedArray, width: number, height: number) {
  const output = new Uint8ClampedArray(data.length);
  const paper = estimatePaper(data, width, height);
  const ink = new Uint8Array(width * height);
  const normalized = new Uint8ClampedArray(data.length);
  for (let pixel = 0; pixel < ink.length; pixel++) {
    const offset = pixel * 4;
    let lo = 255, hi = 0;
    for (let c = 0; c < 3; c++) {
      const value = Math.min(255, Math.round(data[offset + c] * 255 / paper[pixel * 3 + c]));
      normalized[offset + c] = value; lo = Math.min(lo, value); hi = Math.max(hi, value);
    }
    normalized[offset + 3] = 255;
    ink[pixel] = Number(data[offset + 3] >= 24 && (lo < 215 || hi - lo > 40));
  }
  // Close small gaps in the outline so the interior is not flooded as background.
  const radius = Math.max(1, Math.round(Math.max(width, height) * 0.025));
  let barrier = maskPass(ink, width, height, radius, true, true);
  barrier = maskPass(barrier, width, height, radius, false, true);
  barrier = maskPass(barrier, width, height, radius, true, false);
  barrier = maskPass(barrier, width, height, radius, false, false);
  for (let pixel = 0; pixel < ink.length; pixel++) barrier[pixel] |= ink[pixel];

  // Keep the character: the largest blob not cut by the picture edge, plus other
  // big blobs. Small marks inside the character (eyes, buttons) are always kept;
  // only specks and edge clutter lying on the outside paper are dropped.
  let exterior = floodExterior(barrier, width, height);
  const { labels, area, touchesEdge } = components(barrier, width, height);
  const outside = area.map(() => false);
  for (let pixel = 0; pixel < ink.length; pixel++) {
    if (!barrier[pixel]) continue;
    const x = pixel % width;
    if ((x > 0 && exterior[pixel - 1]) || (x + 1 < width && exterior[pixel + 1]) ||
      (pixel >= width && exterior[pixel - width]) || (pixel + width < ink.length && exterior[pixel + width])) outside[labels[pixel]] = true;
  }
  let main = -1;
  for (let id = 0; id < area.length; id++) if (!touchesEdge[id] && (main < 0 || area[id] > area[main])) main = id;
  if (main < 0) for (let id = 0; id < area.length; id++) if (main < 0 || area[id] > area[main]) main = id;
  const keep = area.map((size, id) => id === main || !outside[id] || (!touchesEdge[id] && size >= area[main] * 0.1));
  let dropped = false;
  for (let pixel = 0; pixel < ink.length; pixel++) {
    if (barrier[pixel] && !keep[labels[pixel]]) { barrier[pixel] = 0; ink[pixel] = 0; dropped = true; }
  }
  if (dropped) exterior = floodExterior(barrier, width, height);
  const queue = new Int32Array(width * height);
  let tail = 0;
  for (let pixel = 0; pixel < ink.length; pixel++) if (exterior[pixel]) queue[tail++] = pixel;
  let head = 0;

  // Gap-closing also fills narrow concave paper (between an arm and the body).
  // Let the outside flood into closed-but-not-ink pixels; the enclosed interior,
  // which lies outside the closed band, still stays white.
  const visitBand = (pixel: number) => {
    if (exterior[pixel] || ink[pixel]) return;
    exterior[pixel] = 1;
    queue[tail++] = pixel;
  };
  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % width; const y = Math.floor(pixel / width);
    for (const next of [x > 0 ? pixel - 1 : -1, x + 1 < width ? pixel + 1 : -1, y > 0 ? pixel - width : -1, y + 1 < height ? pixel + width : -1]) {
      if (next >= 0 && barrier[next]) visitBand(next);
    }
  }
  for (let pixel = 0; pixel < ink.length; pixel++) {
    const offset = pixel * 4;
    if (ink[pixel]) output.set(normalized.subarray(offset, offset + 4), offset);
    else if (exterior[pixel]) output.set([0, 0, 0, 0], offset);
    else output.set([255, 255, 255, 255], offset); // empty space inside the character
  }
  return output;
}
