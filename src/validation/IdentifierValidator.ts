import { Keywords } from '../naming/Keywords';

/** Sanitizes formatted names and avoids reserved-word collisions. */
export class IdentifierValidator {
  /** Returns a legal-looking identifier for the selected language. */
  public validate(candidate: string, languageId: string, keywords: Keywords): string {
    let result = candidate.replace(/[\s\-]+/gu, '').replace(/[^\p{L}\p{N}_$]/gu, '');
    if (!result) return result;
    if (/^\p{N}/u.test(result)) result = `_${result}`;
    if (keywords.has(languageId, result)) result = `${result}_`;
    return result;
  }
}
