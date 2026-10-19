const TIME_ZONE = 'Europe/Zurich'
const DAY_MS = 86_400_000
const BERN_LATITUDE = 46.948
const BERN_LONGITUDE = 7.4474
const SUNRISE_ZENITH = (90.833 * Math.PI) / 180

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function dateParts(date: Date) {
  const parts = dateFormatter.formatToParts(date)
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value)

  return { year: part('year'), month: part('month'), day: part('day') }
}

function solarTimesForDay(year: number, month: number, day: number) {
  const dayOfYear = (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / DAY_MS
  const daysInYear = new Date(Date.UTC(year, 1, 29)).getUTCDate() === 29 ? 366 : 365
  const gamma = (2 * Math.PI * (dayOfYear - 1)) / daysInYear

  const equationOfTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma))
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma)

  const latitude = (BERN_LATITUDE * Math.PI) / 180
  const hourAngleCos =
    Math.cos(SUNRISE_ZENITH) / (Math.cos(latitude) * Math.cos(declination)) -
    Math.tan(latitude) * Math.tan(declination)
  const hourAngle = (Math.acos(Math.max(-1, Math.min(1, hourAngleCos))) * 180) / Math.PI
  const solarNoonUtc = 720 - 4 * BERN_LONGITUDE - equationOfTime
  const midnightUtc = Date.UTC(year, month - 1, day)

  return {
    sunrise: new Date(midnightUtc + (solarNoonUtc - 4 * hourAngle) * 60_000),
    sunset: new Date(midnightUtc + (solarNoonUtc + 4 * hourAngle) * 60_000),
  }
}

export function getSunTimes(date: Date) {
  const { year, month, day } = dateParts(date)
  const times = solarTimesForDay(year, month, day)

  return {
    sunrise: timeFormatter.format(times.sunrise),
    sunset: timeFormatter.format(times.sunset),
  }
}
