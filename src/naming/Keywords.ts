const COMMON = new Set(['abstract','as','assert','async','await','break','case','catch','class','const','continue','default','delete','do','else','enum','export','extends','false','finally','for','from','function','if','implements','import','in','instanceof','interface','let','new','null','package','private','protected','public','return','static','super','switch','this','throw','true','try','typeof','var','void','while','with','yield']);

/** Reserved words grouped by VS Code language identifier. */
export class Keywords {
  private readonly words = new Map<string, Set<string>>([
    ['typescript', new Set([...COMMON, 'any','boolean','namespace','number','string','type','unknown'])],
    ['typescriptreact', new Set([...COMMON, 'any','boolean','namespace','number','string','type','unknown'])],
    ['javascript', new Set([...COMMON])],
    ['javascriptreact', new Set([...COMMON])],
    ['java', new Set([...COMMON, 'boolean','byte','char','double','final','float','int','long','native','short','synchronized','throws','transient','volatile'])],
    ['python', new Set(['False','None','True','and','as','assert','async','await','break','class','continue','def','del','elif','else','except','finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield'])],
    ['c', new Set([...COMMON, 'auto','char','double','extern','float','int','long','register','short','signed','sizeof','typedef','unsigned','void'])],
    ['cpp', new Set([...COMMON, 'auto','bool','char','double','extern','float','int','long','register','short','signed','sizeof','typedef','unsigned','void','nullptr','template','typename'])]
  ]);

  /** Reports whether a candidate is reserved in the given language. */
  public has(languageId: string, identifier: string): boolean {
    const words = this.words.get(languageId);
    return words?.has(identifier) ?? words?.has(identifier.toLocaleLowerCase('en-US')) ?? false;
  }
}
