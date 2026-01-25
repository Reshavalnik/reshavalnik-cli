export type MixedSegment =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string; display: boolean }

const normalizeText = (value: string): string => {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

export const splitIntoTextAndMathSegments = (input: string): MixedSegment[] => {
  const segments: MixedSegment[] = []
  if (!input) {
    return segments
  }

  const normalized = normalizeText(input)
  let cursor = 0
  while (cursor < normalized.length) {
    const inlineStart = normalized.indexOf('\\(', cursor)
    const blockStart = normalized.indexOf('\\[', cursor)
    const hasInline = inlineStart !== -1
    const hasBlock = blockStart !== -1

    if (!hasInline && !hasBlock) {
      segments.push({ type: 'text', value: normalized.slice(cursor) })
      break
    }

    let start = 0
    let display = false
    if (hasInline && hasBlock) {
      if (inlineStart <= blockStart) {
        start = inlineStart
        display = false
      } else {
        start = blockStart
        display = true
      }
    } else if (hasInline) {
      start = inlineStart
      display = false
    } else {
      start = blockStart
      display = true
    }

    if (start > cursor) {
      segments.push({ type: 'text', value: normalized.slice(cursor, start) })
    }

    const endDelimiter = display ? '\\]' : '\\)'
    const contentStart = start + 2
    const end = normalized.indexOf(endDelimiter, contentStart)
    if (end === -1) {
      segments.push({ type: 'text', value: normalized.slice(start) })
      break
    }

    segments.push({
      type: 'math',
      value: normalized.slice(contentStart, end),
      display,
    })
    cursor = end + 2
  }

  return segments
}
