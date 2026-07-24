/**
 * Converts the theme's space-separated `hsl(h s% l%)` token strings into an
 * `rgb(r, g, b)` string, which react-native-skia's color parser accepts
 * reliably (its HSL parsing expects the comma form, not CSS Color 4 spaces).
 */
export function hslStringToRgb(hsl: string): string {
  const match = hsl.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)/);
  if (!match) return hsl;

  const h = Number(match[1]);
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const to255 = (value: number) => Math.round((value + m) * 255);
  return `rgb(${to255(r)}, ${to255(g)}, ${to255(b)})`;
}
