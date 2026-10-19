export type Kind = 'spring' | 'summer' | 'autumn' | 'winter'

export interface SeasonEvent {
  kind: Kind
  at: Date
  day: number // day number in Europe/Zurich
}

const TZ = 'Europe/Zurich'
const DAY_MS = 86_400_000
const DELTA_T_S = 69 // TT -> UT, approx. for 2020s

// Meeus, Astronomical Algorithms ch. 27 (valid 1000..3000)
const COEFFS: Record<Kind, [number, number, number, number, number]> = {
  spring: [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],
  summer: [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.0003],
  autumn: [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],
  winter: [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032],
}

const TERMS: [number, number, number][] = [
  [485, 324.96, 1934.136],
  [203, 337.23, 32964.467],
  [199, 342.08, 20.186],
  [182, 27.85, 445267.112],
  [156, 73.14, 45036.886],
  [136, 171.52, 22518.443],
  [77, 222.54, 65928.934],
  [74, 296.72, 3034.906],
  [70, 243.58, 9037.513],
  [58, 119.81, 33718.147],
  [52, 297.17, 150.678],
  [50, 21.02, 2281.226],
  [45, 247.54, 29929.562],
  [44, 325.15, 31555.956],
  [29, 60.93, 4443.417],
  [18, 155.12, 67555.328],
  [17, 288.79, 4562.452],
  [16, 198.04, 62894.029],
  [14, 199.76, 31436.921],
  [12, 95.39, 14577.848],
  [12, 287.11, 31931.756],
  [12, 320.81, 34777.259],
  [9, 227.73, 1222.114],
  [8, 15.45, 16859.074],
]

const rad = (deg: number) => (deg * Math.PI) / 180

function seasonInstant(year: number, kind: Kind): Date {
  const Y = (year - 2000) / 1000
  const [a, b, c, d, e] = COEFFS[kind]
  const jde0 = a + b * Y + c * Y ** 2 + d * Y ** 3 + e * Y ** 4
  const T = (jde0 - 2451545.0) / 36525
  const W = 35999.373 * T - 2.47
  const dLambda = 1 + 0.0334 * Math.cos(rad(W)) + 0.0007 * Math.cos(rad(2 * W))
  const S = TERMS.reduce((sum, [A, B, C]) => sum + A * Math.cos(rad(B + C * T)), 0)
  const jde = jde0 + (0.00001 * S) / dLambda
  return new Date((jde - 2440587.5) * DAY_MS - DELTA_T_S * 1000)
}

const ymdFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Calendar day in Europe/Zurich as days since epoch */
export function dayNumber(d: Date): number {
  const [y, m, dd] = ymdFormat.format(d).split('-').map(Number)
  return Date.UTC(y!, m! - 1, dd!) / DAY_MS
}

export function fmtDay(n: number): string {
  return new Date(n * DAY_MS).toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** 01:00 UTC on the last Sunday of the given month (month0: 0-based) */
function lastSundayUtc(year: number, month0: number): number {
  const last = new Date(Date.UTC(year, month0 + 1, 0))
  return Date.UTC(year, month0, last.getUTCDate() - last.getUTCDay(), 1)
}

export function getSeasonEvents(year: number): SeasonEvent[] {
  const kinds: Kind[] = ['spring', 'summer', 'autumn', 'winter']
  const list: SeasonEvent[] = []
  for (let y = year - 1; y <= year + 2; y++) {
    for (const kind of kinds) {
      const at = seasonInstant(y, kind)
      list.push({ kind, at, day: dayNumber(at) })
    }
  }
  return list.sort((x, y) => x.day - y.day)
}

export function getUpcoming(events: SeasonEvent[], today: number) {
  return (['winter', 'summer', 'spring', 'autumn'] as Kind[]).map((kind) => {
    const event = events.find((e) => e.kind === kind && e.day >= today)!
    return { kind, date: fmtDay(event.day), days: event.day - today }
  })
}

export function getMirrorDayForSolstice(
  events: SeasonEvent[],
  solstice: SeasonEvent,
  today: number,
) {
  const d = today - solstice.day
  const target =
    d < 0
      ? solstice.day - d
      : events.find((event) => event.kind === solstice.kind && event.day > solstice.day)!.day - d
  return { date: fmtDay(target), days: target - today }
}

/**
 * Mirror day around the nearest solstice S, with d = today - S:
 *  - before S (d < 0): S + |d|
 *  - after S (d >= 0): the next occurrence of the same solstice minus d
 */
export function getMirrorDay(events: SeasonEvent[], today: number) {
  const solstices = events.filter((e) => e.kind === 'summer' || e.kind === 'winter')
  const nearest = solstices.reduce((best, e) =>
    Math.abs(e.day - today) < Math.abs(best.day - today) ? e : best,
  )
  const mirror = getMirrorDayForSolstice(events, nearest, today)
  return {
    kind: nearest.kind,
    offset: Math.abs(today - nearest.day),
    ...mirror,
  }
}

export function getNextDst(now: Date, today: number) {
  const nowMs = now.getTime()
  const candidates: { at: number; toSummer: boolean }[] = []
  for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
    candidates.push({ at: lastSundayUtc(y, 2), toSummer: true })
    candidates.push({ at: lastSundayUtc(y, 9), toSummer: false })
  }
  const next = candidates.filter((c) => c.at > nowMs).sort((a, b) => a.at - b.at)[0]!
  const day = dayNumber(new Date(next.at))
  return {
    date: fmtDay(day),
    days: day - today,
    label: next.toSummer
      ? '02:00 → 03:00 (to CEST, summer time)'
      : '03:00 → 02:00 (to CET, winter time)',
  }
}
