import katex from 'katex'
import DOMPurify from 'dompurify'

const GREEK_LETTERS = new Set([
  'alpha',
  'beta',
  'gamma',
  'delta',
  'epsilon',
  'zeta',
  'eta',
  'theta',
  'iota',
  'kappa',
  'lambda',
  'mu',
  'nu',
  'xi',
  'omicron',
  'pi',
  'rho',
  'sigma',
  'tau',
  'upsilon',
  'phi',
  'chi',
  'psi',
  'omega',
])

const ANGLE_KEYWORD = '\u044A\u0433\u044A\u043B'
const DEGREE_KEYWORD = '\u0433\u0440\u0430\u0434\u0443\u0441\u0430'

type TokenType =
  | 'identifier'
  | 'number'
  | 'operator'
  | 'comma'
  | 'lparen'
  | 'rparen'
  | 'lbracket'
  | 'rbracket'
  | 'symbol'
  | 'eof'

type Token = {
  type: TokenType
  value?: string
}

type NodeKind = 'identifier' | 'number' | 'other'

type Node = {
  latex: string
  kind: NodeKind
  raw?: string
}

const normalizeInput = (input: string): string => {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\\\')
    .replace(/[‘’]/g, "'")
}

const isLetter = (char: string): boolean => {
  return /[\p{L}]/u.test(char)
}

const isDigit = (char: string): boolean => {
  return /[\p{N}]/u.test(char)
}

const tokenize = (input: string): Token[] => {
  const tokens: Token[] = []
  let index = 0

  while (index < input.length) {
    const char = input[index] ?? ''

    if (/\s/.test(char)) {
      index += 1
      continue
    }

    if (input.startsWith('**', index)) {
      tokens.push({ type: 'operator', value: '**' })
      index += 2
      continue
    }

    if (input.startsWith('>=', index)) {
      tokens.push({ type: 'operator', value: '>=' })
      index += 2
      continue
    }

    if (char === '/') {
      tokens.push({ type: 'operator', value: '/' })
      index += 1
      continue
    }

    if (char === ',') {
      tokens.push({ type: 'comma' })
      index += 1
      continue
    }

    if (char === '(') {
      tokens.push({ type: 'lparen' })
      index += 1
      continue
    }

    if (char === ')') {
      tokens.push({ type: 'rparen' })
      index += 1
      continue
    }

    if (char === '[') {
      tokens.push({ type: 'lbracket' })
      index += 1
      continue
    }

    if (char === ']') {
      tokens.push({ type: 'rbracket' })
      index += 1
      continue
    }

    if (isDigit(char)) {
      let value = char
      index += 1
      while (index < input.length && (isDigit(input[index] ?? '') || input[index] === '.')) {
        value += input[index] ?? ''
        index += 1
      }
      tokens.push({ type: 'number', value })
      continue
    }

    if (isLetter(char) || char === '_' || char === "'") {
      let value = char
      index += 1
      while (index < input.length) {
        const nextChar = input[index] ?? ''
        if (isLetter(nextChar) || isDigit(nextChar) || nextChar === '_' || nextChar === "'") {
          value += nextChar
          index += 1
          continue
        }
        break
      }
      tokens.push({ type: 'identifier', value })
      continue
    }

    tokens.push({ type: 'symbol', value: char })
    index += 1
  }

  tokens.push({ type: 'eof' })
  return tokens
}

const asNode = (latex: string, kind: NodeKind = 'other', raw?: string): Node => ({
  latex,
  kind,
  raw,
})

const shouldGroup = (latex: string): boolean => {
  if (latex.length <= 1) {
    return false
  }
  if (/^[A-Za-z0-9]+$/.test(latex)) {
    return false
  }
  if (/^\\[A-Za-z]+$/.test(latex)) {
    return false
  }
  return true
}

const wrapIfNeeded = (latex: string): string => {
  return shouldGroup(latex) ? `{${latex}}` : latex
}

class Parser {
  private tokens: Token[]
  private index = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): Node {
    const parts: Node[] = []
    while (!this.is('eof')) {
      parts.push(this.parseRelation())
      if (this.is('eof')) {
        break
      }
    }
    if (parts.length === 1) {
      return parts[0] ?? asNode('', 'other')
    }
    return asNode(parts.map((part) => part.latex).join(' '), 'other')
  }

  private parseRelation(): Node {
    let left = this.parseFraction()
    while (this.is('operator', '>=')) {
      this.advance()
      const right = this.parseFraction()
      left = asNode(`${left.latex} \\ge ${right.latex}`, 'other')
    }
    return left
  }

  private parseFraction(): Node {
    let left = this.parsePower()
    while (this.is('operator', '/')) {
      this.advance()
      const right = this.parsePower()
      left = asNode(`\\frac{${left.latex}}{${right.latex}}`, 'other')
    }
    return left
  }

  private parsePower(): Node {
    let left = this.parsePrimary()
    if (this.is('operator', '**')) {
      this.advance()
      const right = this.parsePower()
      left = asNode(`${wrapIfNeeded(left.latex)}^{${right.latex}}`, 'other')
    }
    return left
  }

  private parsePrimary(): Node {
    const token = this.current()

    if (token.type === 'identifier') {
      const value = token.value ?? ''
      const lower = value.toLowerCase()
      this.advance()

      if (lower === ANGLE_KEYWORD) {
        const target = this.parsePrimary()
        return asNode(`\\angle ${target.latex}`, 'other')
      }

      if (this.is('lparen')) {
        this.advance()
        const args = this.parseArguments('rparen')
        return this.finishFunctionCall(value, lower, args)
      }

      let node = this.resolveIdentifier(value)
      node = this.applyDegree(node)
      return node
    }

    if (token.type === 'number') {
      this.advance()
      return this.applyDegree(asNode(token.value ?? '', 'number', token.value))
    }

    if (token.type === 'lparen') {
      this.advance()
      return this.parseGroup()
    }

    if (token.type === 'lbracket') {
      this.advance()
      const content = this.parseArguments('rbracket', false)
      if (content.length === 1) {
        const first = content[0]
        if (!first) {
          return asNode('\\overline{}', 'other')
        }
        return asNode(`\\overline{${first.latex}}`, 'other')
      }
      return asNode(`\\overline{${content.map((item) => item.latex).join(',')}}`, 'other')
    }

    if (token.type === 'symbol') {
      this.advance()
      return asNode(token.value ?? '', 'other')
    }

    this.advance()
    return asNode('', 'other')
  }

  private parseArguments(closeType: TokenType, allowComma = true): Node[] {
    const args: Node[] = []
    if (this.is(closeType)) {
      this.advance()
      return args
    }

    args.push(this.parseRelation())

    while (allowComma && this.is('comma')) {
      this.advance()
      args.push(this.parseRelation())
    }

    if (this.is(closeType)) {
      this.advance()
    }

    return args
  }

  private parseGroup(): Node {
    const args = this.parseArguments('rparen')
    if (args.length === 0) {
      return asNode('()', 'other')
    }
    if (args.length === 1) {
      const first = args[0]
      if (!first) {
        return asNode('()', 'other')
      }
      return asNode(`\\left(${first.latex}\\right)`, 'other')
    }
    const mapped = this.mapTuple(args)
    if (mapped) {
      return mapped
    }
    return asNode(`\\left(${args.map((item) => item.latex).join(',')}\\right)`, 'other')
  }

  private mapTuple(args: Node[]): Node | null {
    const first = args[0]
    const second = args[1]
    const third = args[2]
    const fourth = args[3]

    if (args.length === 1 && first && first.kind === 'identifier' && first.raw === 'ZM') {
      return asNode('\\varnothing', 'other')
    }

    if (args.length === 3 && second && second.kind === 'identifier' && first && third) {
      const op = second.raw ?? ''
      const left = first.latex
      const right = third.latex
      switch (op) {
        case 'Elem':
          return asNode(`${left} \\in ${right}`, 'other')
        case 'NElem':
          return asNode(`${left} \\notin ${right}`, 'other')
        case 'Pod':
          return asNode(`${left} \\subseteq ${right}`, 'other')
        case 'NPod':
          return asNode(`${left} \\not\\subseteq ${right}`, 'other')
        case 'U':
          return asNode(`${left} \\cup ${right}`, 'other')
        case 'S':
          return asNode(`${left} \\cup ${right}`, 'other')
        default:
          return null
      }
    }

    if (args.length === 4 && first && first.kind === 'identifier' && second && third && fourth) {
      const op = first.raw ?? ''
      const from = second.latex
      const to = third.latex
      const expr = fourth.latex
      if (op === 'U') {
        return asNode(`\\bigcup_{k=${from}}^{${to}} ${expr}`, 'other')
      }
      if (op === 'S') {
        return asNode(`\\bigcap_{k=${from}}^{${to}} ${expr}`, 'other')
      }
    }

    return null
  }

  private finishFunctionCall(name: string, lowerName: string, args: Node[]): Node {
    const arg0 = args[0]
    const arg1 = args[1]
    const arg2 = args[2]
    const arg3 = args[3]
    switch (lowerName) {
      case 'sqrt':
        return arg0 ? asNode(`\\sqrt{${arg0.latex}}`, 'other') : asNode('\\sqrt{}', 'other')
      case 'rad':
        return arg0 && arg1
          ? asNode(`\\sqrt[${arg0.latex}]{${arg1.latex}}`, 'other')
          : asNode('\\sqrt[]{}', 'other')
      case 'log':
        return arg0 && arg1
          ? asNode(`\\log_{${arg0.latex}}\\left(${arg1.latex}\\right)`, 'other')
          : asNode(`\\log\\left(${arg0?.latex ?? ''}\\right)`, 'other')
      case 'exp':
        return arg0 && arg1
          ? asNode(`${wrapIfNeeded(arg0.latex)}^{${arg1.latex}}`, 'other')
          : asNode(`${name}^{${arg0?.latex ?? ''}}`, 'other')
      case 'abs':
        return arg0 ? asNode(`\\left|${arg0.latex}\\right|`, 'other') : asNode('\\left|\\right|', 'other')
      case 'sum':
        return arg0 && arg1 && arg2
          ? asNode(`\\sum_{k=${arg1.latex}}^{${arg2.latex}} ${arg0.latex}`, 'other')
          : asNode(`\\sum ${arg0?.latex ?? ''}`, 'other')
      case 'prod':
        return arg0 && arg1 && arg2
          ? asNode(`\\prod_{k=${arg1.latex}}^{${arg2.latex}} ${arg0.latex}`, 'other')
          : asNode(`\\prod ${arg0?.latex ?? ''}`, 'other')
      case 'int':
        return arg0 && arg1
          ? asNode(`\\int ${arg0.latex}\\,${arg1.latex}`, 'other')
          : asNode(`\\int ${arg0?.latex ?? ''}`, 'other')
      case 'intop':
        return arg0 && arg1 && arg2 && arg3
          ? asNode(`\\int_{${arg1.latex}}^{${arg2.latex}} ${arg0.latex}\\,${arg3.latex}`, 'other')
          : asNode(`\\int ${arg0?.latex ?? ''}`, 'other')
      case 'lim':
      case 'limf': {
        const variable = arg0?.latex ?? ''
        const target = this.normalizeLimitTarget(arg1)
        const expr = arg2?.latex ?? ''
        return asNode(`\\lim_{${variable} \\to ${target}} ${expr}`, 'other')
      }
      case 'v':
        return arg0 && arg1
          ? asNode(`V_{${arg1.latex}}^{${arg0.latex}}`, 'other')
          : asNode(`V_{${arg0?.latex ?? ''}}`, 'other')
      case 'c':
        return arg0 && arg1
          ? asNode(`C_{${arg1.latex}}^{${arg0.latex}}`, 'other')
          : asNode(`C_{${arg0?.latex ?? ''}}`, 'other')
      case 'p':
        return arg0 ? asNode(`P_{${arg0.latex}}`, 'other') : asNode('P', 'other')
      case 'sin':
      case 'cos':
      case 'tan':
      case 'tg':
      case 'ctg':
      case 'cot':
      case 'ln':
      case 'lg': {
        const mapped = lowerName === 'tg' ? 'tan' : lowerName === 'ctg' ? 'cot' : lowerName
        return arg0
          ? asNode(`\\${mapped}\\left(${arg0.latex}\\right)`, 'other')
          : asNode(`\\${mapped}`, 'other')
      }
      default:
        if (args.length === 1) {
          if (name.includes("'")) {
            return asNode(`${name}\\left(${arg0?.latex ?? ''}\\right)`, 'other')
          }
          if (name.length === 1 && name.toLowerCase() === 'a') {
            return asNode(`${name}_{${arg0?.latex ?? ''}}`, 'other')
          }
          return asNode(`${name}\\left(${arg0?.latex ?? ''}\\right)`, 'other')
        }
        return asNode(`${name}\\left(${args.map((item) => item.latex).join(',')}\\right)`, 'other')
    }
  }

  private resolveIdentifier(value: string): Node {
    const lower = value.toLowerCase()
    if (GREEK_LETTERS.has(lower)) {
      return asNode(`\\${lower}`, 'identifier', value)
    }
    return asNode(value, 'identifier', value)
  }

  private normalizeLimitTarget(node: Node | undefined): string {
    if (!node) {
      return ''
    }
    const raw = node.kind === 'identifier' ? (node.raw ?? '') : ''
    if (raw === 'BP') {
      return '+\\infty'
    }
    if (raw === 'BM') {
      return '-\\infty'
    }
    return node.latex
  }

  private applyDegree(node: Node): Node {
    if (this.is('identifier')) {
      const nextValue = this.current().value ?? ''
      if (nextValue && nextValue.toLowerCase() === DEGREE_KEYWORD) {
        this.advance()
        return asNode(`${wrapIfNeeded(node.latex)}^{\\circ}`, 'other')
      }
    }
    return node
  }

  private current(): Token {
    return this.tokens[this.index] ?? { type: 'eof' }
  }

  private is(type: TokenType, value?: string): boolean {
    const token = this.current()
    if (token.type !== type) {
      return false
    }
    if (value !== undefined) {
      return token.value === value
    }
    return true
  }

  private advance(): void {
    if (this.index < this.tokens.length - 1) {
      this.index += 1
    }
  }
}

const convertCustomMarkers = (input: string): string => {
  if (!input) {
    return ''
  }
  const normalized = normalizeInput(input)
  const tokens = tokenize(normalized)
  const parser = new Parser(tokens)
  return parser.parse().latex
}

export const renderMath = (text: string): string => {
  const raw = text ?? ''
  if (!raw) {
    return ''
  }
  try {
    const latex = convertCustomMarkers(raw)
    const html = katex.renderToString(latex, { throwOnError: false })
    return DOMPurify.sanitize(html)
  } catch {
    return DOMPurify.sanitize(raw)
  }
}
