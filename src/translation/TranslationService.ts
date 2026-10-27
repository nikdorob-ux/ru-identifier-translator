import type { TranslationProvider } from './TranslationProvider';

/** Calls translation strategies in order until one returns candidates. */
export class TranslationService {
  public constructor(private readonly providers: readonly TranslationProvider[]) {}

  /** Translates one word through the provider chain. */
  public async translate(word: string): Promise<string[]> {
    const errors: Error[] = [];
    for (const provider of this.providers) {
      try {
        const result = [...new Set((await provider.translate(word)).map((value) => value.trim()).filter(Boolean))];
        if (result.length) return result;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }
    }
    if (errors.length === this.providers.length && errors.length > 0) {
      throw new AggregateError(errors, 'All translation providers failed');
    }
    return [];
  }
}
