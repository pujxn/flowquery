// Tokenises and re-parameterises the SQL WHERE clause emitted by the compiler.
// The compiler always double-quotes identifiers ("amount") and escapes single
// quotes inside strings with '' — this parser relies on that contract.

type Token =
  | { type: 'quoted_identifier'; value: string }
  | { type: 'string_literal';    value: string }
  | { type: 'number_literal';    value: number }
  | { type: 'keyword';           value: string }
  | { type: 'operator';          value: string }
  | { type: 'punctuation';       value: string }
  | { type: 'whitespace';        value: string }

const KEYWORDS    = new Set(['AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'WHERE', 'NULL', 'TRUE', 'FALSE'])
const TWO_CHAR_OP = new Set(['<=', '>=', '!=', '<>'])
const ONE_CHAR_OP = new Set(['=', '<', '>'])
const PUNCT       = new Set(['(', ')', ','])

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < input.length) {
    // Whitespace / newlines
    if (/\s/.test(input[i])) {
      let j = i
      while (j < input.length && /\s/.test(input[j])) j++
      tokens.push({ type: 'whitespace', value: input.slice(i, j) })
      i = j
      continue
    }

    // Double-quoted identifier: "column_name"
    if (input[i] === '"') {
      let j = i + 1
      while (j < input.length && input[j] !== '"') j++
      if (j >= input.length) throw new Error('Unterminated double-quoted identifier')
      tokens.push({ type: 'quoted_identifier', value: input.slice(i + 1, j) })
      i = j + 1
      continue
    }

    // String literal: 'value' with '' escaping
    if (input[i] === "'") {
      let j = i + 1
      let value = ''
      while (j < input.length) {
        if (input[j] === "'") {
          if (input[j + 1] === "'") { value += "'"; j += 2 }
          else break
        } else {
          value += input[j++]
        }
      }
      if (j >= input.length) throw new Error('Unterminated string literal')
      tokens.push({ type: 'string_literal', value })
      i = j + 1
      continue
    }

    // Number literal (possibly negative, possibly decimal)
    if (/\d/.test(input[i]) || (input[i] === '-' && /\d/.test(input[i + 1] ?? ''))) {
      let j = i
      if (input[j] === '-') j++
      while (j < input.length && /[\d.]/.test(input[j])) j++
      const num = parseFloat(input.slice(i, j))
      if (isNaN(num)) throw new Error(`Invalid number at position ${i}`)
      tokens.push({ type: 'number_literal', value: num })
      i = j
      continue
    }

    // Word: keyword or bare identifier (compiler shouldn't emit bare identifiers,
    // but handle gracefully so BETWEEN...AND parses cleanly)
    if (/[a-zA-Z_]/.test(input[i])) {
      let j = i
      while (j < input.length && /[a-zA-Z0-9_]/.test(input[j])) j++
      const word = input.slice(i, j).toUpperCase()
      tokens.push({ type: KEYWORDS.has(word) ? 'keyword' : 'quoted_identifier', value: word })
      i = j
      continue
    }

    // Two-char operators
    const two = input.slice(i, i + 2)
    if (TWO_CHAR_OP.has(two)) { tokens.push({ type: 'operator', value: two }); i += 2; continue }

    // One-char operators
    if (ONE_CHAR_OP.has(input[i])) { tokens.push({ type: 'operator', value: input[i] }); i++; continue }

    // Punctuation
    if (PUNCT.has(input[i])) { tokens.push({ type: 'punctuation', value: input[i] }); i++; continue }

    throw new Error(`Unexpected character "${input[i]}" at position ${i}`)
  }

  return tokens
}

export function parameterizeWhere(
  rawWhere: string,
  allowedColumns: Set<string>,
): { sql: string; params: unknown[] } {
  const input = rawWhere.trim().replace(/^WHERE\s+/i, '')
  const tokens = tokenize(input)
  const params: unknown[] = []
  let sql = ''

  for (const tok of tokens) {
    switch (tok.type) {
      case 'whitespace':
        sql += tok.value
        break
      case 'quoted_identifier':
        if (!allowedColumns.has(tok.value.toLowerCase())) {
          throw new Error(`Column "${tok.value}" is not permitted`)
        }
        sql += `"${tok.value}"`
        break
      case 'keyword':
      case 'operator':
      case 'punctuation':
        sql += tok.value
        break
      case 'string_literal':
        params.push(tok.value)
        sql += `$${params.length}`
        break
      case 'number_literal':
        params.push(tok.value)
        sql += `$${params.length}`
        break
    }
  }

  return { sql, params }
}
