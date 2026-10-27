import { describe, expect, it } from 'vitest';
import { Formatter } from '../src/naming/Formatter';
import { IdentifierSplitter } from '../src/parsing/IdentifierSplitter';
import { KindDetector } from '../src/parsing/KindDetector';
import { Keywords } from '../src/naming/Keywords';
import { IdentifierValidator } from '../src/validation/IdentifierValidator';
import { TranslationService } from '../src/translation/TranslationService';
import type { TranslationProvider } from '../src/translation/TranslationProvider';

describe('IdentifierSplitter', () => {
  const splitter = new IdentifierSplitter();
  it.each([
    ['МаксимальноеЗначение', ['Максимальное', 'Значение']],
    ['максимальное_значение', ['максимальное', 'значение']],
    ['максимальное-значение', ['максимальное', 'значение']],
    ['максимальное значение', ['максимальное', 'значение']],
    ['HTTPОтвет', ['HTTP', 'Ответ']]
  ])('splits %s', (input, expected) => expect(splitter.split(input)).toEqual(expected));
});

describe('Formatter', () => {
  const formatter = new Formatter();
  it('formats common styles', () => {
    expect(formatter.format(['max', 'value'], 'camelCase')).toBe('maxValue');
    expect(formatter.format(['max', 'value'], 'snake_case')).toBe('max_value');
    expect(formatter.format(['max', 'value'], 'PascalCase')).toBe('MaxValue');
    expect(formatter.format(['max', 'value'], 'UPPER_SNAKE_CASE')).toBe('MAX_VALUE');
  });
  it('selects styles by language and kind', () => {
    expect(formatter.styleFor('python', 'variable', 'camelCase')).toBe('snake_case');
    expect(formatter.styleFor('typescript', 'class', 'snake_case')).toBe('PascalCase');
    expect(formatter.styleFor('cpp', 'constant', 'camelCase')).toBe('UPPER_SNAKE_CASE');
    expect(formatter.styleFor('ruby', 'variable', 'PascalCase')).toBe('PascalCase');
  });
});

describe('KindDetector', () => {
  const detector = new KindDetector();
  it.each([
    ['class Класс', 'class'], ['def функция', 'function'], ['function действие', 'function'],
    ['const Значение', 'constant'], ['static final Значение', 'constant'], ['let Значение', 'variable'],
    ['unrecognized prefix', 'variable']
  ] as const)('detects %s as %s', (prefix, expected) => expect(detector.detect(prefix)).toBe(expected));
});

describe('IdentifierValidator', () => {
  const validator = new IdentifierValidator();
  const keywords = new Keywords();
  it('sanitizes forbidden characters and leading digits', () => expect(validator.validate('12 bad-name!', 'python', keywords)).toBe('_12badname'));
  it('suffixes reserved keywords', () => expect(validator.validate('class', 'python', keywords)).toBe('class_'));
  it('allows valid names unchanged', () => expect(validator.validate('max_value', 'python', keywords)).toBe('max_value'));
});

describe('TranslationService', () => {
  it('moves to the next provider after failure and deduplicates candidates', async () => {
    const failing: TranslationProvider = { name: 'first', translate: async () => { throw new Error('offline'); } };
    const succeeding: TranslationProvider = { name: 'second', translate: async () => ['value', ' value ', 'amount'] };
    await expect(new TranslationService([failing, succeeding]).translate('значение')).resolves.toEqual(['value', 'amount']);
  });
  it('reports failure when every provider throws', async () => {
    const failing: TranslationProvider = { name: 'offline', translate: async () => { throw new Error('offline'); } };
    await expect(new TranslationService([failing]).translate('слово')).rejects.toThrow('All translation providers failed');
  });
  it('returns empty candidates when providers return no result', async () => {
    const empty: TranslationProvider = { name: 'empty', translate: async () => [] };
    await expect(new TranslationService([empty]).translate('слово')).resolves.toEqual([]);
  });
});
