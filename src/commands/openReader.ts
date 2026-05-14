import * as path from "node:path";
import * as vscode from "vscode";
import { chunkMarkdown } from "../markdown/chunkMarkdown";
import type { ReadingCard, ReadingCardType } from "../markdown/types";
import { getReadingState, saveReadingState } from "../state/readingState";
import { getFileName } from "../utils/path";
import { getWebviewHtml } from "../webview/getWebviewHtml";

type WebviewMessage =
  | {
      type: "revealSource";
      index: number;
    }
  | {
      type: "savePosition";
      index: number;
      cardId?: string;
      bookmarkedCardIds?: string[];
      readCardIds?: string[];
      collapsedCodeCardIds?: string[];
      typeFilter?: ReadingCardType | "all";
      codeWrap?: boolean;
      showBookmarksOnly?: boolean;
      tocOpen?: boolean;
      focusMode?: boolean;
    };

export async function openReader(context: vscode.ExtensionContext): Promise<void> {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showInformationMessage("Open a Markdown file before launching MD Shorts.");
    return;
  }

  const document = editor.document;

  if (document.languageId !== "markdown") {
    vscode.window.showInformationMessage("MD Shorts can only read Markdown files.");
    return;
  }

  const markdown = document.getText();

  if (markdown.length > 1_000_000) {
    const answer = await vscode.window.showWarningMessage(
      "This Markdown document is large. Creating cards may take a moment.",
      "Continue",
      "Cancel"
    );

    if (answer !== "Continue") {
      return;
    }
  }

  const config = vscode.workspace.getConfiguration("mdShorts");
  const cards = createCards(markdown, config);

  if (cards.length === 0) {
    vscode.window.showInformationMessage("There is no readable Markdown content in this file.");
    return;
  }

  const documentUri = document.uri.toString();
  const rememberPosition = config.get<boolean>("rememberPosition", true);
  const previousState = rememberPosition ? getReadingState(context, documentUri) : undefined;
  const initialIndex = getInitialIndex(
    cards,
    previousState?.currentCardId,
    previousState?.currentIndex
  );
  const openBeside = config.get<boolean>("openBeside", true);
  let currentCards = cards;

  const panel = vscode.window.createWebviewPanel(
    "mdShorts.reader",
    `MD Shorts: ${getFileName(document.uri)}`,
    openBeside ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: getLocalResourceRoots(document.uri)
    }
  );
  currentCards = resolveWebviewImageUris(cards, panel.webview, document.uri);

  panel.webview.html = getWebviewHtml({
    webview: panel.webview,
    cards: currentCards,
    initialIndex,
    initialBookmarkedCardIds: previousState?.bookmarkedCardIds,
    initialReadCardIds: previousState?.readCardIds,
    initialCollapsedCodeCardIds: previousState?.collapsedCodeCardIds,
    initialTypeFilter: previousState?.typeFilter,
    initialCodeWrap: previousState?.codeWrap,
    initialShowBookmarksOnly: previousState?.showBookmarksOnly,
    initialTocOpen: previousState?.tocOpen,
    initialFocusMode: previousState?.focusMode
  });

  panel.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
    if (message.type === "revealSource") {
      await revealSource(document.uri, currentCards[message.index], editor.viewColumn);
      return;
    }

    if (message.type === "savePosition" && rememberPosition) {
      await saveReadingState(context, {
        documentUri,
        currentCardId: message.cardId,
        currentIndex: clampIndex(message.index, currentCards.length),
        bookmarkedCardIds: Array.isArray(message.bookmarkedCardIds)
          ? message.bookmarkedCardIds.filter((cardId) => typeof cardId === "string")
          : previousState?.bookmarkedCardIds,
        readCardIds: Array.isArray(message.readCardIds)
          ? message.readCardIds.filter((cardId) => typeof cardId === "string")
          : previousState?.readCardIds,
        collapsedCodeCardIds: Array.isArray(message.collapsedCodeCardIds)
          ? message.collapsedCodeCardIds.filter((cardId) => typeof cardId === "string")
          : previousState?.collapsedCodeCardIds,
        typeFilter: isKnownTypeFilter(message.typeFilter)
          ? message.typeFilter
          : previousState?.typeFilter,
        codeWrap: message.codeWrap,
        showBookmarksOnly: message.showBookmarksOnly,
        tocOpen: message.tocOpen,
        focusMode: message.focusMode,
        updatedAt: Date.now()
      });
    }
  });

  let updateTimer: NodeJS.Timeout | undefined;
  const autoRefresh = config.get<boolean>("autoRefresh", true);
  const changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
    if (!autoRefresh || event.document.uri.toString() !== documentUri) {
      return;
    }

    if (updateTimer) {
      clearTimeout(updateTimer);
    }

    updateTimer = setTimeout(() => {
      currentCards = resolveWebviewImageUris(
        createCards(event.document.getText(), vscode.workspace.getConfiguration("mdShorts")),
        panel.webview,
        event.document.uri
      );
      panel.webview.postMessage({
        type: "updateCards",
        cards: currentCards
      });
    }, 300);
  });

  panel.onDidDispose(() => {
    if (updateTimer) {
      clearTimeout(updateTimer);
    }

    changeDisposable.dispose();
  });
}

function createCards(markdown: string, config: vscode.WorkspaceConfiguration): ReadingCard[] {
  return chunkMarkdown(markdown, {
    minCardChars: config.get<number>("minCardChars", 120),
    maxCardChars: config.get<number>("maxCardChars", 700)
  });
}

async function revealSource(
  uri: vscode.Uri,
  card: ReadingCard | undefined,
  preferredColumn: vscode.ViewColumn | undefined
): Promise<void> {
  if (!card) {
    return;
  }

  const document = await vscode.workspace.openTextDocument(uri);
  const editor = await vscode.window.showTextDocument(
    document,
    preferredColumn ?? vscode.ViewColumn.One
  );
  const start = new vscode.Position(card.startLine, 0);
  const end = new vscode.Position(card.endLine, Number.MAX_SAFE_INTEGER);
  const range = new vscode.Range(start, end);

  editor.selection = new vscode.Selection(start, end);
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
}

function getInitialIndex(
  cards: ReadingCard[],
  currentCardId: string | undefined,
  currentIndex: number | undefined
): number {
  if (currentCardId) {
    const cardIndex = cards.findIndex((card) => card.id === currentCardId);

    if (cardIndex >= 0) {
      return cardIndex;
    }
  }

  return clampIndex(currentIndex ?? 0, cards.length);
}

function clampIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(index, length - 1));
}

function isKnownTypeFilter(value: unknown): value is ReadingCardType | "all" {
  return (
    value === "all" ||
    value === "heading" ||
    value === "paragraph" ||
    value === "code" ||
    value === "list" ||
    value === "blockquote" ||
    value === "image" ||
    value === "table" ||
    value === "thematicBreak" ||
    value === "review" ||
    value === "mixed"
  );
}

function getLocalResourceRoots(documentUri: vscode.Uri): vscode.Uri[] {
  if (documentUri.scheme !== "file") {
    return [];
  }

  return [vscode.Uri.joinPath(documentUri, "..")];
}

function resolveWebviewImageUris(
  cards: ReadingCard[],
  webview: vscode.Webview,
  documentUri: vscode.Uri
): ReadingCard[] {
  return cards.map((card) => {
    if (card.type !== "image" || !card.meta?.imageUrl) {
      return card;
    }

    const imageWebviewUri = getImageWebviewUri(card.meta.imageUrl, webview, documentUri);

    if (!imageWebviewUri) {
      return card;
    }

    return {
      ...card,
      meta: {
        ...card.meta,
        imageWebviewUri
      }
    };
  });
}

function getImageWebviewUri(
  imageUrl: string,
  webview: vscode.Webview,
  documentUri: vscode.Uri
): string | undefined {
  if (/^(https?:|data:)/iu.test(imageUrl)) {
    return imageUrl;
  }

  if (documentUri.scheme !== "file") {
    return undefined;
  }

  const imagePath = imageUrl.split(/[?#]/u)[0];

  if (!imagePath || /^(mailto:|#)/iu.test(imagePath)) {
    return undefined;
  }

  const imageUri = path.isAbsolute(imagePath)
    ? vscode.Uri.file(imagePath)
    : vscode.Uri.joinPath(documentUri, "..", imagePath);

  return webview.toWebviewUri(imageUri).toString();
}
