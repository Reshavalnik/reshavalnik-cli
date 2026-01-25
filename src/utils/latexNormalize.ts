const HAS_DELIMITERS = /\\\(|\\\)|\\\[|\\\]|\$\$|\$/
const HAS_LATEX_COMMANDS = /\\(frac|cdot|sqrt|begin)|[\^_]/
const SIMPLE_FRACTION = /^\s*-?\s*[A-Za-z0-9]+(?:\s*\/\s*[A-Za-z0-9]+)\s*$/

const wrapLatexIfNeeded = (value: string): string => {
  if (HAS_DELIMITERS.test(value)) {
    return value
  }
  if (!HAS_LATEX_COMMANDS.test(value)) {
    return value
  }
  const isDisplay = /\\begin\{aligned\}|\\\\/.test(value)
  return isDisplay ? `\\[${value}\\]` : `\\(${value}\\)`
}

const normalizeMultiplicationDots = (value: string): string => {
  return value.replace(/([0-9A-Za-z)])\s*\.\s*([0-9A-Za-z(])/g, '$1\\\\cdot $2')
}

const fixBrokenFractions = (value: string): string => {
  let normalized = value
  normalized = normalized.replace(/\\frac\{frac\{/g, '\\\\frac{\\\\frac{')
  normalized = normalized.replace(/\}\}frac\{/g, '}{\\\\frac{')
  normalized = normalized.replace(/\}frac\{/g, '}{\\\\frac{')
  return normalized
}

export const normalizeLatexText = (input: string): string => {
  if (!input) {
    return input
  }
  let value = input.replace(/\f/g, '\\')
  value = fixBrokenFractions(value)
  value = normalizeMultiplicationDots(value)
  return wrapLatexIfNeeded(value)
}

export const normalizeOptionValue = (input: string): string => {
  if (!input) {
    return input
  }
  const value = input.replace(/\f/g, '\\')
  if (SIMPLE_FRACTION.test(value)) {
    const parts = value.split('/')
    const numerator = (parts[0] ?? '').trim()
    const denominator = parts[1]?.trim() ?? ''
    return `\\(\\frac{${numerator}}{${denominator}}\\)`
  }
  return normalizeLatexText(value)
}
