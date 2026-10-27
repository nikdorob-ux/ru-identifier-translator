const CAMEL_BOUNDARY = /([a-zа-яё0-9])([A-ZА-ЯЁ])/g;
const UPPER_ACRONYM_BOUNDARY = /([A-ZА-ЯЁ])([A-ZА-ЯЁ][a-zа-яё])/g;

/** Splits identifiers written in camel, snake, kebab, or space-separated form. */
export class IdentifierSplitter {
  /** Produces normalized non-empty words. */
  public split(identifier: string): string[] {
    return identifier
      .replace(UPPER_ACRONYM_BOUNDARY, '$1 $2')
      .replace(CAMEL_BOUNDARY, '$1 $2')
      .split(/[\s_-]+/u)
      .map((word) => word.trim())
      .filter(Boolean);
  }
}
