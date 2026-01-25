const HAS_DELIMITERS = /\\\(|\\\)|\\\[|\\\]|\$\$|\$/
const HAS_LATEX_TOKENS = /\\(frac|sqrt|cdot)|\^\{|_\{/

export const wrapOptionIfMissingDelimiters = (value: string): string => {
  if (!value) {
    return value
  }
  if (HAS_DELIMITERS.test(value)) {
    return value
  }
  if (!HAS_LATEX_TOKENS.test(value)) {
    return value
  }
  return `\\(${value}\\)`
}
