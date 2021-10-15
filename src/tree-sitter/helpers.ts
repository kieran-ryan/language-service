import { ParameterType } from '@cucumber/cucumber-expressions'
import Parser from 'web-tree-sitter'

export function recordFromMatch<T extends string>(
  match: Parser.QueryMatch,
  keys: readonly T[]
): Record<T, string | undefined> {
  const values = keys.map((name) => match.captures.find((c) => c.name === name)?.node?.text)
  return Object.fromEntries(keys.map((_, i) => [keys[i], values[i]])) as Record<
    T,
    string | undefined
  >
}

export function makeParameterType(name: string, regexp: string) {
  return new ParameterType(name, regexp, Object, () => undefined, false, false)
}

export function unquote(s: string) {
  return s.substring(1, s.length - 1)
}
