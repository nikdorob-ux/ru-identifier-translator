import type { TranslationProvider } from './TranslationProvider';

/** Translates through Google's unofficial translate endpoint. */
export class GoogleProvider implements TranslationProvider {
  public readonly name = 'google';

  public constructor(private readonly timeoutMs: number) {}

  /** Returns the translated phrase, or no candidates for an empty response. */
  public async translate(word: string): Promise<string[]> {
    const url = new URL('https://translate.googleapis.com/translate_a/single');
    url.searchParams.set('client', 'gtx');
    url.searchParams.set('sl', 'ru');
    url.searchParams.set('tl', 'en');
    url.searchParams.set('dt', 't');
    url.searchParams.set('q', word);
    const response = await fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) });
    if (!response.ok) throw new Error(`Google Translate HTTP ${response.status}`);
    const data: unknown = await response.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) return [];
    const translated = (data[0] as unknown[])
      .filter((part): part is unknown[] => Array.isArray(part))
      .map((part) => typeof part[0] === 'string' ? part[0] : '')
      .join('')
      .trim();
    return translated ? [translated] : [];
  }
}
