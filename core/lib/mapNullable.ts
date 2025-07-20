export const mapNullable = <T, U>(
  value: T | null | undefined,
  f: (value: T) => U,
): U | null | undefined => {
  if (value === null) return null
  if (value === undefined) return undefined
  return f(value)
}

export const mapUndefined = <T, U>(value: T | undefined, f: (value: T) => U): U | undefined => {
  if (value === undefined) return undefined
  return f(value)
}
