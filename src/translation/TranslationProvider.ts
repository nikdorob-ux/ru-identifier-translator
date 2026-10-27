/** Strategy interface for a remote Russian-to-English translation provider. */
export interface TranslationProvider {
  readonly name: string;
  /** Returns distinct English translation candidates, or an empty list. */
  translate(word: string): Promise<string[]>;
}
