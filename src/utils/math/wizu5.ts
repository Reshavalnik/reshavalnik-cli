type Wizu5Node =
  | { type: 'text'; value: string }
  | { type: 'group'; children: Wizu5Node[] }
  | { type: 'sup'; base: Wizu5Node; exponent: Wizu5Node }
  | { type: 'dl'; numerator: Wizu5Node[]; denominator: Wizu5Node[] }

// Demo strings (dev-only reference):
// "Стойността на израза DL((33+12),(93+6)) е:"
// "(9) ** 3 · 36 ** 2"
// "DL(230·318·255, 88·98·512)"
// "3**18"
// "9**9"
// "2**(3**2)"

const escapeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

class Wizu5Parser {
  private input: string
  private index = 0

  constructor(input: string) {
    this.input = input
  }

  parse(): Wizu5Node[] {
    return this.parseExpression([])
  }

  private parseExpression(stopChars: string[]): Wizu5Node[] {
    const nodes: Wizu5Node[] = []
    while (this.index < this.input.length) {
      const char = this.peek()
      if (stopChars.includes(char)) {
        break
      }
      const node = this.parsePower(stopChars)
      if (!node) {
        break
      }
      nodes.push(node)
    }
    return nodes
  }

  // Exponentiation is right-associative: a**b**c == a**(b**c).
  private parsePower(stopChars: string[]): Wizu5Node | null {
    const base = this.parsePrimary(stopChars)
    if (!base) {
      return null
    }
    if (this.match('**')) {
      this.index += 2
      const exponent = this.parsePower(stopChars)
      if (exponent) {
        return { type: 'sup', base, exponent }
      }
      return base
    }
    return base
  }

  private parsePrimary(stopChars: string[]): Wizu5Node | null {
    if (this.match('DL(')) {
      return this.parseDl()
    }
    const char = this.peek()
    if (char === '(') {
      return this.parseGroup()
    }
    return this.parseText(stopChars)
  }

  private parseDl(): Wizu5Node | null {
    this.index += 3
    const numerator = this.parseExpression([',', ')'])
    if (this.peek() === ',') {
      this.index += 1
    }
    const denominator = this.parseExpression([')'])
    if (this.peek() === ')') {
      this.index += 1
    }
    return { type: 'dl', numerator, denominator }
  }

  private parseGroup(): Wizu5Node | null {
    this.index += 1
    const children = this.parseExpression([')'])
    if (this.peek() === ')') {
      this.index += 1
    }
    return { type: 'group', children }
  }

  private parseText(stopChars: string[]): Wizu5Node | null {
    let value = ''
    const startIndex = this.index
    while (this.index < this.input.length) {
      const char = this.peek()
      if (stopChars.includes(char)) {
        break
      }
      if (this.match('DL(') || this.match('**') || char === '(') {
        break
      }
      value += char
      this.index += 1
    }
    if (!value && this.index === startIndex) {
      const fallbackChar = this.peek()
      if (!fallbackChar) {
        return null
      }
      this.index += 1
      return { type: 'text', value: fallbackChar }
    }
    return { type: 'text', value }
  }

  private match(value: string): boolean {
    return this.input.startsWith(value, this.index)
  }

  private peek(): string {
    return this.input[this.index] ?? ''
  }
}

const renderNode = (node: Wizu5Node): string => {
  switch (node.type) {
    case 'text':
      return escapeHtml(node.value)
    case 'group':
      return `(${node.children.map(renderNode).join('')})`
    case 'sup':
      return `<span class="math-sup">${renderNode(node.base)}<sup class="math-sup__exp">${renderNode(node.exponent)}</sup></span>`
    case 'dl':
      return `<span class="math-frac"><span class="math-frac__top">${node.numerator.map(renderNode).join('')}</span><span class="math-frac__bar"></span><span class="math-frac__bottom">${node.denominator.map(renderNode).join('')}</span></span>`
    default:
      return ''
  }
}

export const renderWizu5Html = (input: string): string => {
  if (!input) {
    return ''
  }
  const parser = new Wizu5Parser(input)
  const nodes = parser.parse()
  return nodes.map(renderNode).join('')
}
