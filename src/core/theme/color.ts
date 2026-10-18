/** Small color helpers. Pure functions, so themes can be checked in tests. */

export type Rgb = [number, number, number];

export function hslToRgb(h: number, s: number, l: number): Rgb {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return 255 * (light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return [Math.round(f(0)), Math.round(f(8)), Math.round(f(4))];
}

export function toRgb(color: string): Rgb {
  if (color.startsWith('#')) {
    const n = parseInt(color.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  throw new Error(`Unsupported color: ${color}`);
}

export const toHex = ([r, g, b]: Rgb): string =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

/** Relative luminance, 0 (black) to 1 (white), as defined by WCAG. */
export function luminance(color: string | Rgb): number {
  const rgb = typeof color === 'string' ? toRgb(color) : color;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors. 4.5 is the usual bar for text, 3 for large text and icons. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * A color of the given hue and saturation whose brightness matches `targetLuminance`.
 * Fixed HSL lightness looks uneven (yellow glows, blue sinks), so tiles are matched by
 * luminance instead, which keeps the digit on every tile equally readable.
 */
export function colorWithLuminance(hue: number, saturation: number, targetLuminance: number): string {
  let lo = 0;
  let hi = 100;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (luminance(hslToRgb(hue, saturation, mid)) < targetLuminance) lo = mid;
    else hi = mid;
  }
  return toHex(hslToRgb(hue, saturation, (lo + hi) / 2));
}
