
# RuIdentifier Translator

Автор: Бородкин Алексей Сергеевич, группа М3106

При разработке использовалась нейросеть Claude.

Расширение VS Code переводит русские идентификаторы в английские имена, оформляя их в стиле активного языка. Перевод выполняется онлайн через MyMemory с резервным Google Translate endpoint; кэширование не используется.

## Возможности

- Команда `ruIdentifier.translate`, сочетание `Ctrl+Alt+T` (`Cmd+Alt+T` на macOS) и пункт контекстного меню редактора.
- Перевод выделения или слова под курсором; поддерживаются несколько выделений и курсоров.
- Разбиение camelCase/PascalCase, snake_case, kebab-case и слов через пробел; каждое слово переводится отдельно.
- Стиль по языку и эвристически определённому виду идентификатора (переменная, функция, класс, константа).
- `ruIdentifier.translateAs` позволяет выбрать вид идентификатора через QuickPick.
- Выбор альтернатив перевода, прогресс, таймауты и цепочка провайдеров с автоматическим переключением.
- Проверка результата: удаление запрещённых символов, префикс для цифры, суффикс для ключевого слова.
- Одна операция редактирования для всех замен, отменяемая единым `Ctrl+Z`.

## Установка и запуск

1. Установите Node.js 18+ и npm.
2. Выполните `npm install` и `npm run compile`.
3. Откройте папку проекта в VS Code, выберите конфигурацию **Run RuIdentifier Translator** и нажмите `F5`. Откроется Extension Development Host.
4. Для установки пакета установите `vsce` либо используйте включённый `@vscode/vsce`, затем выполните `npm run package` (эквивалент `vsce package`).

## Примеры

| До | Язык / вид | Возможный результат |
|---|---|---|
| `Значение` | TypeScript, переменная | `value` |
| `МаксимальноеЗначение` | TypeScript, переменная | `maximumValue` |
| `Класс` | Python, класс | `Class` |
| `Максимальное_Значение` | Python, константа | `MAXIMUM_VALUE` |

Фактический перевод зависит от ответа внешнего сервиса и доступных вариантов.

## Настройки

| Настройка | По умолчанию | Назначение |
|---|---|---|
| `ruIdentifier.defaultStyle` | `camelCase` | Стиль для языков без профиля: `camelCase`, `snake_case`, `PascalCase`, `UPPER_SNAKE_CASE`. |
| `ruIdentifier.askWhenMultiple` | `true` | Показывать выбор при нескольких вариантах перевода. |
| `ruIdentifier.requestTimeoutMs` | `5000` | Таймаут каждого HTTP-запроса в миллисекундах. |
| `ruIdentifier.providers` | `["mymemory", "google"]` | Провайдеры по приоритету: `mymemory`, `google`. |

## Команды и клавиши

- **Translate Russian Identifier** — `ruIdentifier.translate`, `Ctrl+Alt+T` / `Cmd+Alt+T`.
- **Translate Identifier As…** — `ruIdentifier.translateAs`, выбор вида идентификатора через QuickPick.

## Разработка

- `npm run compile` — строгая сборка TypeScript.
- `npm test` — юнит-тесты без сети и VS Code.
- `npm run docs` — генерация TypeDoc в `docs/api`.
- `F5` — запуск в Extension Development Host.
- `npm run package` — сборка VSIX.

