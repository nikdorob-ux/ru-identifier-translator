import * as vscode from 'vscode';

/** Presents translation choices and progress through the VS Code UI. */
export class Picker {
  /** Returns the chosen candidate, or undefined when the user cancels. */
  public async choose(candidates: readonly string[], askWhenMultiple: boolean): Promise<string | undefined> {
    if (candidates.length === 1 || !askWhenMultiple) return candidates[0];
    return vscode.window.showQuickPick([...candidates], { placeHolder: 'Выберите вариант перевода' });
  }

  /** Runs a translation task with editor progress feedback. */
  public withProgress<T>(task: () => Promise<T>): Thenable<T> {
    return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Перевод русского идентификатора…', cancellable: false }, task);
  }

  /** Displays an informational notification. */
  public info(message: string): void {
    void vscode.window.showInformationMessage(message);
  }

  /** Displays an error notification. */
  public error(message: string): void {
    void vscode.window.showErrorMessage(message);
  }
}
