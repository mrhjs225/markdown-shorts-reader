# MD Shorts Development Notes

This document is for local development and release work. The root `README.md` is written for the VS Code Marketplace overview.

## Project

MD Shorts is a VS Code extension that reads the active Markdown document and displays it as short cards in a Webview.

Main areas:

- `src/commands/openReader.ts`: command entrypoint, Webview creation, VS Code integration
- `src/markdown/chunkMarkdown.ts`: Markdown AST parsing and card generation
- `src/webview/getWebviewHtml.ts`: Webview UI, keyboard handling, search, filters, bookmarks
- `src/state/readingState.ts`: per-document reading state
- `test/markdown/chunkMarkdown.test.ts`: parser/card tests

## Local Setup

```bash
npm install
npm run compile
npm test
npm run lint
```

To run the extension locally:

1. Open this folder in VS Code.
2. Press `F5`.
3. Choose `Run MD Shorts Extension`.
4. In the Extension Development Host window, open a Markdown file.
5. Run `MD Shorts: Open Reader` from the Command Palette.

For iterative development:

```bash
npm run watch
```

Then reload the Extension Development Host window after code changes.

## Useful Commands

```bash
npm run compile
npm test
npm run lint
npm run check
npm run format
```

`npm run check` currently runs compile and tests. Run lint separately before publishing.

## Marketplace Metadata

Important fields live in `package.json`:

- `name`: extension identifier part, currently `md-shorts`
- `displayName`: shown as the Marketplace title
- `description`: short Marketplace summary
- `publisher`: Marketplace publisher ID
- `icon`: Marketplace icon path, currently `assets/icon.png`
- `repository`: public source repository

The Marketplace Overview tab is rendered from the root `README.md`.

The Version History tab is rendered from `CHANGELOG.md`.

## Packaging

Install `vsce` if needed:

```bash
npm install -g @vscode/vsce
```

Package locally:

```bash
npm run compile
npm test
npm run lint
vsce package
```

Install the generated VSIX locally:

```bash
code --install-extension md-shorts-0.1.0.vsix
```

## Publishing

Log in with the Marketplace publisher ID:

```bash
vsce login JinseokHeo
```

Publish the current version:

```bash
vsce publish
```

Publish with a version bump:

```bash
vsce publish patch
vsce publish minor
vsce publish 0.2.0
```

Before publishing:

```bash
npm run compile
npm test
npm run lint
vsce package
```

Check the generated `.vsix` locally before publishing a public release.

## Release Checklist

- [ ] Update `CHANGELOG.md`.
- [ ] Confirm `package.json` version.
- [ ] Run `npm run compile`.
- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `vsce package`.
- [ ] Install the generated `.vsix` locally.
- [ ] Test `MD Shorts: Open Reader` on a Markdown file.
- [ ] Run `vsce publish`.

## Marketplace Asset Notes

- `icon` must point to a PNG file. SVG icons are not accepted for publishing.
- README and CHANGELOG images should use `https` URLs.
- Avoid SVG images in Marketplace-rendered Markdown unless they are from trusted badge providers.
