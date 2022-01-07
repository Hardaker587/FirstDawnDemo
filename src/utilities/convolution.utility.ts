export const convolute = (
  pixels: ImageData,
  output: ImageData,
  weights: number[],
  opaque: number,
  channel: string[] = ["r", "g", "b"]
) => {
  const side = Math.round(Math.sqrt(weights.length));
  const halfSide = Math.floor(side / 2);
  const src = pixels.data;
  const sw = pixels.width;
  const sh = pixels.height;
  // pad output by the convolution matrix
  const w = sw;
  const h = sh;
  const dst = output.data;
  // go through the destination image pixels
  const alphaFac = opaque ? 1 : 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sy = y;
      const sx = x;
      const dstOff = (y * w + x) * 4;
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      let r = 0,
          g = 0,
          b = 0,
          a = 0;
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = sy + cy - halfSide;
          const scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            const srcOff = (scy * sw + scx) * 4;
            const wt = weights[cy * side + cx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
            a += src[srcOff + 3] * wt;
          }
        }
      }
      channel.includes("r") ? (dst[dstOff] += r / 3) : null;
      channel.includes("g") ? (dst[dstOff + 1] += g / 3) : null;
      channel.includes("b") ? (dst[dstOff + 2] += b / 3) : null;
      dst[dstOff + 3] = a + alphaFac * (255 - a);
    }
  }
  return output;
};
