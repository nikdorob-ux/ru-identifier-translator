import type { IdentifierKind, NamingStyle } from './NamingStyle';

/** Formats translated words according to a language and identifier kind. */
export class Formatter {
  /** Chooses the convention used for the active source language. */
  public styleFor(languageId: string, kind: IdentifierKind, fallback: NamingStyle): NamingStyle {
    if (kind === 'class') return 'PascalCase';
    if (kind === 'constant') return 'UPPER_SNAKE_CASE';
    if (['typescript', 'javascript', 'javascriptreact', 'typescriptreact', 'java'].includes(languageId)) return 'camelCase';
    if (['python', 'c', 'cpp'].includes(languageId)) return 'snake_case';
    return fallback;
  }

  /** Joins translated words into a valid casing shape. */
  public format(words: readonly string[], style: NamingStyle): string {
    const normalized = words.map((word) => word.replace(/[^\p{L}\p{N}]+/gu, '')).filter(Boolean);
    if (normalized.length === 0) return '';
    const lower = normalized.map((word) => word.toLocaleLowerCase('en-US'));
    switch (style) {
      case 'snake_case': return lower.join('_');
      case 'UPPER_SNAKE_CASE': return lower.map((word) => word.toLocaleUpperCase('en-US')).join('_');
      case 'PascalCase': return lower.map(Formatter.capitalize).join('');
      case 'camelCase': return lower.map((word, index) => index === 0 ? word : Formatter.capitalize(word)).join('');
    }
  }

  private static capitalize(word: string): string {
    return word.length ? word[0]!.toLocaleUpperCase('en-US') + word.slice(1) : word;
  }
}
