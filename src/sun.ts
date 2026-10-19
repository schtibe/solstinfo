import { DAY_MS, TZ, rad } from './equinox'

const BERN_LATITUDE = rad(46.948)
const BERN_LONGITUDE = 7.4474
const SUNRISE_ZENITH = rad(90.833)

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Sunrise/sunset in Bern for the given day number (NOAA approximation) */
export function getSunTimes(day: number) {
  const midnightUtc = day * DAY_MS
  const year = new Date(midnightUtc).getUTCFullYear()
  const dayOfYear = day - Date.UTC(year, 0, 0) / DAY_MS
  const daysInYear = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / DAY_MS
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

  const hourAngleCos =
    Math.cos(SUNRISE_ZENITH) / (Math.cos(BERN_LATITUDE) * Math.cos(declination)) -
    Math.tan(BERN_LATITUDE) * Math.tan(declination)
  const hourAngle = (Math.acos(Math.max(-1, Math.min(1, hourAngleCos))) * 180) / Math.PI
  const solarNoonUtc = 720 - 4 * BERN_LONGITUDE - equationOfTime

  return {
    sunrise: timeFormatter.format(new Date(midnightUtc + (solarNoonUtc - 4 * hourAngle) * 60_000)),
    sunset: timeFormatter.format(new Date(midnightUtc + (solarNoonUtc + 4 * hourAngle) * 60_000)),
  }
}
