/**
 *
 * @param {time} value
 * @returns time value formatted as a timestamp
 */
export const timestampFormatter = value =>
  new Date(value * 1000).toISOString().slice(11, 21)

/**
 * @param {time} t
 */
export const round = t => Math.round(t * 10) / 10
