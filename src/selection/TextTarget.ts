import * as vscode from 'vscode';

/** A replaceable editor range with its original text. */
export interface TextTarget {
  readonly range: vscode.Range;
  readonly text: string;
}

/** Resolves selections or words under all active cursors. */
export class TextTargetResolver {
  /** Returns unique non-empty targets from the current editor. */
  public resolve(editor: vscode.TextEditor): TextTarget[] {
    const unique = new Map<string, TextTarget>();
    for (const selection of editor.selections) {
      const range = selection.isEmpty
        ? editor.document.getWordRangeAtPosition(selection.active, /[\p{L}\p{N}_-]+/u)
        : selection;
      if (!range) continue;
      const text = editor.document.getText(range);
      if (text) unique.set(`${range.start.line}:${range.start.character}:${range.end.line}:${range.end.character}`, { range, text });
    }
    return [...unique.values()];
  }
}
