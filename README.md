# MD Shorts

Read long Markdown files as short, focused cards in VS Code.

## Features

- Convert the active Markdown file into reading cards.
- Navigate cards with buttons, arrow keys, Space, Home, and End.
- Search cards and jump between matches.
- Jump between Markdown sections.
- Bookmark cards while reading.
- Focus the reader on bookmarked cards.
- Track read cards and show reading progress.
- Show document-level card, word, character, and bookmark stats.
- Filter by card type.
- Collapse long code cards.
- Toggle wrapping for code cards.
- Render image-only paragraphs as image cards when the image can be resolved.
- Render GFM tables as readable tables.
- Add document review cards for heading jumps, empty sections, and oversized sections.
- Detect Mermaid code blocks.
- Reveal the current card's original Markdown source line.
- Refresh cards automatically when the document changes.
- Remember the last card per Markdown document.

## Usage

1. Open a Markdown file.
2. Run `MD Shorts: Open Reader` from the Command Palette.
3. Use `Space`, `ArrowRight`, or `ArrowDown` for the next card.
4. Use `ArrowLeft` or `ArrowUp` for the previous card.
5. Press `Enter` or click `Reveal Source` to jump back to the source.

## Keyboard Shortcuts

| Key                        | Action                               |
| -------------------------- | ------------------------------------ |
| `Space`                    | Next card                            |
| `ArrowRight` / `ArrowDown` | Next card                            |
| `ArrowLeft` / `ArrowUp`    | Previous card                        |
| `Home`                     | First card                           |
| `End`                      | Last card                            |
| `Enter`                    | Reveal source                        |
| `/` or `Ctrl+F` / `Cmd+F`  | Focus card search                    |
| `B`                        | Toggle bookmark                      |
| `M`                        | Toggle bookmarked-card view          |
| `W`                        | Toggle code wrapping                 |
| `C`                        | Collapse or expand current code card |

## Settings

| Setting                     | Default | Description                                                |
| --------------------------- | ------- | ---------------------------------------------------------- |
| `mdShorts.maxCardChars`     | `700`   | Preferred maximum card size before merging stops.          |
| `mdShorts.minCardChars`     | `120`   | Preferred minimum card size before small cards are merged. |
| `mdShorts.rememberPosition` | `true`  | Save the last card per Markdown document.                  |
| `mdShorts.openBeside`       | `true`  | Open the reader beside the current editor.                 |
| `mdShorts.autoRefresh`      | `true`  | Refresh cards when the Markdown document changes.          |

## Development

```bash
npm install
npm run compile
npm test
```

In VS Code, press `F5` and choose `Run MD Shorts Extension` to launch an Extension Development Host.
