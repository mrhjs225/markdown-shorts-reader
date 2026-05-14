# MD Shorts

Read long Markdown files as short, focused cards in VS Code.

MD Shorts helps you move through long README files, design notes, meeting notes, onboarding docs, and generated Markdown one card at a time. Instead of scanning a wall of text, you can focus on the current idea, jump between sections, bookmark important cards, and return to the original source line whenever you need context.

## Features

- Turn headings, paragraphs, lists, blockquotes, code blocks, tables, and image-only paragraphs into focused reading cards.
- Move through cards with buttons, arrow keys, Space, Home, and End.
- Search across cards and jump between matching results.
- Jump between Markdown sections from the section selector.
- Bookmark important cards and switch to a bookmark-only view.
- Track read cards and show reading progress.
- Show document-level card, word, character, and bookmark stats.
- Filter cards by type.
- Collapse code blocks and toggle code wrapping.
- Render GFM tables as readable tables.
- Render resolvable Markdown images inside image cards.
- Add document review cards for heading jumps, empty sections, and oversized sections.
- Detect Mermaid code blocks.
- Reveal the current card's original Markdown source line.
- Refresh cards automatically when the Markdown document changes.
- Remember the last card per Markdown document.

## Usage

1. Open a Markdown file in VS Code.
2. Run `MD Shorts: Open Reader` from the Command Palette.
3. Read the document as cards.
4. Press `Enter` or click `Reveal Source` to jump back to the original Markdown line.

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Next card |
| `ArrowRight` / `ArrowDown` | Next card |
| `ArrowLeft` / `ArrowUp` | Previous card |
| `Home` | First visible card |
| `End` | Last visible card |
| `Enter` | Reveal source |
| `/` or `Ctrl+F` / `Cmd+F` | Focus card search |
| `B` | Toggle bookmark |
| `M` | Toggle bookmarked-card view |
| `W` | Toggle code wrapping |
| `C` | Collapse or expand current code card |

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `mdShorts.maxCardChars` | `700` | Preferred maximum card size before merging stops. |
| `mdShorts.minCardChars` | `120` | Preferred minimum card size before small cards are merged. |
| `mdShorts.rememberPosition` | `true` | Save the last card per Markdown document. |
| `mdShorts.openBeside` | `true` | Open the reader beside the current editor. |
| `mdShorts.autoRefresh` | `true` | Refresh cards when the Markdown document changes. |

## Good For

- Long project README files
- Architecture and design documents
- Pull request descriptions
- Meeting notes
- Onboarding guides
- Generated Markdown reports

## Notes

MD Shorts works locally inside VS Code. It does not require login, cloud sync, or an external service.
