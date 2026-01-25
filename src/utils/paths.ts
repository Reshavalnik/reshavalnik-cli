export const normalizeImagePath = (value: string): string => {
  return value.replace(/\\/g, '/')
}
