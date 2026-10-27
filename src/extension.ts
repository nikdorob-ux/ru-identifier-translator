import * as vscode from 'vscode';
import { Formatter } from './naming/Formatter';
import type { IdentifierKind, NamingStyle } from './naming/NamingStyle';
import { Keywords } from './naming/Keywords';
import { KindDetector } from './parsing/KindDetector';
import { IdentifierSplitter } from './parsing/IdentifierSplitter';
import { TextTargetResolver } from './selection/TextTarget';
import { GoogleProvider } from './translation/GoogleProvider';
import { MyMemoryProvider } from './translation/MyMemoryProvider';
import { TranslationService } from './translation/TranslationService';
import { IdentifierValidator } from './validation/IdentifierValidator';
import { Picker } from './ui/Picker';

const CYRILLIC = /[Ѐ-ӿ]/u;

/** Activates the extension and registers its commands. */
export function activate(context: vscode.ExtensionContext): void {
  const targetResolver = new TextTargetResolver();
  const splitter = new IdentifierSplitter();
  const detector = new KindDetector();
  const formatter = new Formatter();
  const validator = new IdentifierValidator();
  const keywords = new Keywords();
  const picker = new Picker();

  const translate = async (forcedKind?: IdentifierKind): Promise<void> => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const originalSelections = [...editor.selections];
    const targets = targetResolver.resolve(editor);
    const russianTargets = targets.filter((target) => CYRILLIC.test(target.text));
    if (!russianTargets.length) {
      picker.info('В выделенном тексте или слове под курсором нет кириллицы.');
      return;
    }

    const config = vscode.workspace.getConfiguration('ruIdentifier');
    const timeoutMs = config.get<number>('requestTimeoutMs', 5000);
    const providerOrder = config.get<string[]>('providers', ['mymemory', 'google']);
    const registry = new Map<string, import('./translation/TranslationProvider').TranslationProvider>([
      ['mymemory', new MyMemoryProvider(timeoutMs)],
      ['google', new GoogleProvider(timeoutMs)]
    ]);
    const providers = providerOrder.map((name) => registry.get(name)).filter((provider) => provider !== undefined);
    const service = new TranslationService(providers);
    const askWhenMultiple = config.get<boolean>('askWhenMultiple', true);
    const fallbackStyle = config.get<NamingStyle>('defaultStyle', 'camelCase');

    try {
      const edits: Array<{ range: vscode.Range; text: string }> = [];
      let cancelled = false;
      await picker.withProgress(async () => {
        for (const target of russianTargets) {
          const words = splitter.split(target.text);
          const translations: string[] = [];
          for (const word of words) {
            const candidates = await service.translate(word);
            if (!candidates.length) throw new Error(`Нет перевода для слова «${word}».`);
            const selected = await picker.choose(candidates, askWhenMultiple);
            if (!selected) {
              cancelled = true;
              return;
            }
            translations.push(selected);
          }
          if (cancelled) return;
          const linePrefix = editor.document.lineAt(target.range.start.line).text.slice(0, target.range.start.character);
          const kind = forcedKind ?? detector.detect(linePrefix);
          const style = formatter.styleFor(editor.document.languageId, kind, fallbackStyle);
          const result = validator.validate(formatter.format(translations, style), editor.document.languageId, keywords);
          edits.push({ range: target.range, text: result });
        }
      });
      if (cancelled) {
        editor.selections = originalSelections;
        return;
      }
      if (!edits.length) return;
      const applied = await editor.edit((builder) => {
        for (const edit of edits) builder.replace(edit.range, edit.text);
      });
      if (!applied) picker.error('Не удалось изменить документ.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      picker.error(`Ошибка перевода: ${message}. Проверьте подключение к интернету и настройки провайдеров.`);
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('ruIdentifier.translate', () => translate()),
    vscode.commands.registerCommand('ruIdentifier.translateAs', async () => {
      const choices: Array<vscode.QuickPickItem & { value: IdentifierKind }> = [
        { label: 'Переменная', value: 'variable' }, { label: 'Функция', value: 'function' },
        { label: 'Класс', value: 'class' }, { label: 'Константа', value: 'constant' }
      ];
      const selected = await vscode.window.showQuickPick(choices, { placeHolder: 'Выберите вид идентификатора' });
      if (selected) await translate(selected.value);
    })
  );
}

/** Releases extension resources; command subscriptions are disposed by VS Code. */
export function deactivate(): void {}
