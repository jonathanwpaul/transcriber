export const timestampFormatter = value =>
  new Date(value * 1000).toISOString().slice(11, 21)
