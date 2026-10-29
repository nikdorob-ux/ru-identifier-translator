import type { IdentifierKind } from '../naming/NamingStyle';

/** Infers the declaration kind from source text preceding an identifier. */
export class KindDetector {
  /** Examines the current line's prefix and defaults to a variable. */
  public detect(linePrefix: string): IdentifierKind {
    const prefix = linePrefix.trimStart();
    if (/(?:\bclass|\binterface|\bstruct|\benum)\s+[^;{}]*$/iu.test(prefix)) return 'class';
    if (/(?:\bdef|\bfunction|\bfunc)\s+[^;{}]*$/iu.test(prefix)) return 'function';
    if (/(?:\bconst|\bconstexpr|\b#define|\bstatic\s+final|\bfinal)\s+[^;{}]*$/iu.test(prefix)) return 'constant';
    if (/(?:\blet|\bvar|\bstatic|\bint|\bfloat|\bdouble|\bString|\bbool)\s+[^;{}]*$/iu.test(prefix)) return 'variable';
    return 'variable';
  }
}
