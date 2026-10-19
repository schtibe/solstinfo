const START = '#234e6f'
const END = '#e1a132'

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toHex = (n: number): string => Math.round(n).toString(16).padStart(2, '0')

export interface InterpolatedColor {
  background: string
  text: '#ffffff' | '#000000'
}

export function interpolateColor(
  value: number,
  min = 1,
  max = 180,
  start = START,
  end = END,
): InterpolatedColor {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)))
  const [r1, g1, b1] = hexToRgb(start)
  const [r2, g2, b2] = hexToRgb(end)

  const background =
    '#' + toHex(r1 + (r2 - r1) * t) + toHex(g1 + (g2 - g1) * t) + toHex(b1 + (b2 - b1) * t)

  return {
    background,
    text: t < 0.5 ? '#ffffff' : '#000000', // blue half -> white, orange half -> black
  }
}
