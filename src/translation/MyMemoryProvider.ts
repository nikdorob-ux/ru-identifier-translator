import type { TranslationProvider } from './TranslationProvider';

interface MyMemoryResponse {
  responseStatus?: number;
  responseData?: { translatedText?: string };
  matches?: Array<{ translation?: string; match?: number }>;
}

/** Translates through the MyMemory public API. */
export class MyMemoryProvider implements TranslationProvider {
  public readonly name = 'mymemory';

  public constructor(private readonly timeoutMs: number) {}

  /** Requests candidate translations and returns unique results. */
  public async translate(word: string): Promise<string[]> {
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q', word);
    url.searchParams.set('langpair', 'ru|en');
    const response = await fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) });
    if (!response.ok) throw new Error(`MyMemory HTTP ${response.status}`);
    const data = await response.json() as MyMemoryResponse;
    if (data.responseStatus !== undefined && data.responseStatus !== 200) throw new Error('MyMemory returned an error');
    const matches = (data.matches ?? []).map((match) => match.translation ?? '').filter(Boolean);
    const translated = data.responseData?.translatedText;
    return [...new Set([...(translated ? [translated] : []), ...matches])];
  }
}
