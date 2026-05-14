import * as vscode from "vscode";
import type { ReadingCard } from "../markdown/types";
import { getNonce } from "../utils/nonce";

type GetWebviewHtmlOptions = {
  webview: vscode.Webview;
  cards: ReadingCard[];
  initialIndex: number;
  initialBookmarkedCardIds?: string[];
  initialReadCardIds?: string[];
  initialCollapsedCodeCardIds?: string[];
  initialTypeFilter?: string;
  initialCodeWrap?: boolean;
  initialShowBookmarksOnly?: boolean;
};

export function getWebviewHtml(options: GetWebviewHtmlOptions): string {
  const {
    webview,
    cards,
    initialIndex,
    initialBookmarkedCardIds = [],
    initialReadCardIds = [],
    initialCollapsedCodeCardIds = [],
    initialTypeFilter = "all",
    initialCodeWrap = false,
    initialShowBookmarksOnly = false
  } = options;
  const nonce = getNonce();
  const safeCardsJson = JSON.stringify(cards).replace(/</g, "\\u003c");
  const safeBookmarksJson = JSON.stringify(initialBookmarkedCardIds).replace(/</g, "\\u003c");
  const safeReadJson = JSON.stringify(initialReadCardIds).replace(/</g, "\\u003c");
  const safeCollapsedJson = JSON.stringify(initialCollapsedCodeCardIds).replace(/</g, "\\u003c");
  const safeTypeFilterJson = JSON.stringify(initialTypeFilter).replace(/</g, "\\u003c");
  const safeCodeWrapJson = JSON.stringify(Boolean(initialCodeWrap));
  const safeShowBookmarksOnlyJson = JSON.stringify(Boolean(initialShowBookmarksOnly));
  const safeInitialIndex = Math.max(0, Math.min(initialIndex, Math.max(cards.length - 1, 0)));

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';"
  />
  <title>MD Shorts</title>
  <style nonce="${nonce}">
    :root {
      color-scheme: light dark;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }

    button {
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 4px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      cursor: pointer;
      font: inherit;
      min-height: 32px;
      padding: 0 14px;
    }

    button:hover {
      background: var(--vscode-button-hoverBackground);
    }

    button:disabled {
      cursor: default;
      opacity: 0.55;
    }

    .app {
      display: grid;
      grid-template-rows: auto auto auto minmax(0, 1fr) auto;
      min-height: 100vh;
    }

    .topbar {
      align-items: center;
      border-bottom: 1px solid var(--vscode-panel-border);
      display: flex;
      justify-content: space-between;
      min-height: 48px;
      padding: 0 18px;
    }

    .brand {
      font-weight: 700;
    }

    .counter {
      color: var(--vscode-descriptionForeground);
      font-variant-numeric: tabular-nums;
    }

    .topbar-meta {
      align-items: end;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stats {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }

    .tools {
      align-items: center;
      border-bottom: 1px solid var(--vscode-panel-border);
      display: grid;
      gap: 8px;
      grid-template-columns:
        minmax(140px, 1fr)
        auto
        auto
        minmax(150px, 240px)
        minmax(116px, 160px)
        auto
        auto
        auto
        auto
        auto;
      padding: 10px 18px;
    }

    .search-field,
    .section-select,
    .type-filter {
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
      border-radius: 4px;
      color: var(--vscode-input-foreground);
      font: inherit;
      min-height: 32px;
      min-width: 0;
      padding: 0 9px;
      width: 100%;
    }

    .tool-button {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      min-width: 34px;
      padding: 0 10px;
    }

    .tool-button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .tool-button.active {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .match-count {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      min-width: 54px;
      text-align: center;
    }

    .progress {
      background: var(--vscode-editorWidget-background);
      height: 3px;
      overflow: hidden;
    }

    .progress-inner {
      background: var(--vscode-progressBar-background);
      height: 100%;
      transition: width 120ms ease-out;
      width: 0;
    }

    .viewer {
      align-items: center;
      display: flex;
      justify-content: center;
      min-height: 0;
      padding: 28px;
    }

    .card {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: calc(100vh - 214px);
      max-width: 860px;
      min-height: 320px;
      overflow: hidden;
      padding: 26px;
      width: min(100%, 860px);
    }

    .section-path {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      min-height: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .meta-line {
      align-items: center;
      color: var(--vscode-descriptionForeground);
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-height: 20px;
      text-transform: uppercase;
    }

    .type {
      border: 1px solid var(--vscode-badge-background);
      border-radius: 999px;
      color: var(--vscode-badge-foreground);
      font-size: 11px;
      letter-spacing: 0;
      padding: 2px 8px;
    }

    .language {
      font-size: 12px;
    }

    .read-status {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
    }

    .title {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .title:empty {
      display: none;
    }

    .content {
      flex: 1;
      font-family: var(--vscode-font-family);
      font-size: 16px;
      line-height: 1.7;
      margin: 0;
      min-height: 0;
      overflow: auto;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .content.heading {
      align-content: center;
      display: grid;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.3;
    }

    .content.code {
      background: var(--vscode-textCodeBlock-background);
      border-radius: 6px;
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
      line-height: 1.55;
      padding: 16px;
      white-space: pre;
    }

    .content.code.wrap {
      white-space: pre-wrap;
    }

    .content.code.collapsed {
      color: var(--vscode-descriptionForeground);
      display: grid;
      place-items: center;
      white-space: normal;
    }

    .content.blockquote {
      border-left: 3px solid var(--vscode-textLink-foreground);
      color: var(--vscode-descriptionForeground);
      padding-left: 16px;
    }

    .content.image,
    .content.table {
      flex: 0;
    }

    .image-figure {
      align-items: center;
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 10px;
      margin: 0;
      min-height: 0;
      overflow: auto;
    }

    .image-figure[hidden],
    .table-content[hidden] {
      display: none;
    }

    .image-preview {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
    }

    .image-caption {
      color: var(--vscode-descriptionForeground);
      font-size: 13px;
      line-height: 1.45;
      overflow-wrap: anywhere;
      text-align: center;
    }

    .table-content {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }

    .table-content table {
      border-collapse: collapse;
      font-size: 14px;
      min-width: 100%;
    }

    .table-content th,
    .table-content td {
      border: 1px solid var(--vscode-panel-border);
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }

    .table-content th {
      background: var(--vscode-editorWidget-background);
      font-weight: 700;
    }

    .content.review {
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 16px;
    }

    .footer {
      align-items: center;
      border-top: 1px solid var(--vscode-panel-border);
      display: grid;
      gap: 10px;
      grid-template-columns: 1fr auto 1fr;
      min-height: 58px;
      padding: 10px 18px;
    }

    .footer button:first-child {
      justify-self: start;
    }

    .footer button:last-child {
      justify-self: end;
    }

    @media (max-width: 620px) {
      .tools {
        grid-template-columns: minmax(0, 1fr) auto auto;
      }

      .section-select,
      .type-filter,
      .match-count,
      #collapseButton,
      #wrapButton {
        grid-column: 1 / -1;
      }

      .viewer {
        padding: 14px;
      }

      .card {
        max-height: calc(100vh - 168px);
        min-height: 280px;
        padding: 18px;
      }

      .footer {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      button {
        padding: 0 8px;
      }
    }
  </style>
</head>
<body>
  <div class="app">
    <header class="topbar">
      <div class="brand">MD Shorts</div>
      <div class="topbar-meta">
        <div id="counter" class="counter"></div>
        <div id="stats" class="stats"></div>
      </div>
    </header>
    <div class="progress" aria-hidden="true">
      <div id="progressInner" class="progress-inner"></div>
    </div>
    <nav class="tools" aria-label="Reader tools">
      <input id="searchInput" class="search-field" type="search" placeholder="Search cards" />
      <button id="prevMatchButton" class="tool-button" type="button" title="Previous match">Prev</button>
      <button id="nextMatchButton" class="tool-button" type="button" title="Next match">Next</button>
      <select id="sectionSelect" class="section-select" title="Jump to section"></select>
      <select id="typeFilter" class="type-filter" title="Filter card type"></select>
      <button id="bookmarkButton" class="tool-button" type="button" title="Toggle bookmark">Bookmark</button>
      <button id="bookmarkFilterButton" class="tool-button" type="button" title="Show bookmarked cards">Bookmarks</button>
      <button id="collapseButton" class="tool-button" type="button" title="Collapse code card">Collapse Code</button>
      <button id="wrapButton" class="tool-button" type="button" title="Toggle code wrapping">Wrap Code</button>
      <span id="matchCount" class="match-count"></span>
    </nav>
    <main class="viewer">
      <article class="card" aria-live="polite">
        <div id="sectionPath" class="section-path"></div>
        <div class="meta-line">
          <span id="type" class="type"></span>
          <span id="language" class="language"></span>
          <span id="readStatus" class="read-status"></span>
        </div>
        <div id="title" class="title"></div>
        <pre id="content" class="content"></pre>
        <figure id="imageFigure" class="image-figure" hidden>
          <img id="imageContent" class="image-preview" alt="" />
          <figcaption id="imageCaption" class="image-caption"></figcaption>
        </figure>
        <div id="tableContent" class="table-content" hidden></div>
      </article>
    </main>
    <footer class="footer">
      <button id="prevButton" type="button">Previous</button>
      <button id="revealButton" type="button">Reveal Source</button>
      <button id="nextButton" type="button">Next</button>
    </footer>
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let cards = ${safeCardsJson};
    let index = ${safeInitialIndex};
    let bookmarkedCardIds = new Set(${safeBookmarksJson});
    let readCardIds = new Set(${safeReadJson});
    let collapsedCodeCardIds = new Set(${safeCollapsedJson});
    let typeFilter = ${safeTypeFilterJson};
    let codeWrap = ${safeCodeWrapJson};
    let showBookmarksOnly = ${safeShowBookmarksOnlyJson};
    let searchQuery = "";
    let searchMatches = [];

    const counterEl = document.getElementById("counter");
    const statsEl = document.getElementById("stats");
    const progressInnerEl = document.getElementById("progressInner");
    const searchInput = document.getElementById("searchInput");
    const prevMatchButton = document.getElementById("prevMatchButton");
    const nextMatchButton = document.getElementById("nextMatchButton");
    const sectionSelect = document.getElementById("sectionSelect");
    const typeFilterEl = document.getElementById("typeFilter");
    const bookmarkButton = document.getElementById("bookmarkButton");
    const bookmarkFilterButton = document.getElementById("bookmarkFilterButton");
    const collapseButton = document.getElementById("collapseButton");
    const wrapButton = document.getElementById("wrapButton");
    const matchCountEl = document.getElementById("matchCount");
    const sectionPathEl = document.getElementById("sectionPath");
    const typeEl = document.getElementById("type");
    const languageEl = document.getElementById("language");
    const readStatusEl = document.getElementById("readStatus");
    const titleEl = document.getElementById("title");
    const contentEl = document.getElementById("content");
    const imageFigureEl = document.getElementById("imageFigure");
    const imageContentEl = document.getElementById("imageContent");
    const imageCaptionEl = document.getElementById("imageCaption");
    const tableContentEl = document.getElementById("tableContent");
    const prevButton = document.getElementById("prevButton");
    const revealButton = document.getElementById("revealButton");
    const nextButton = document.getElementById("nextButton");

    function render() {
      renderTypeFilter();
      const visibleIndexes = getVisibleIndexes();

      if (!cards.length || !visibleIndexes.length) {
        counterEl.textContent = "0 / 0";
        statsEl.textContent = getStatsLabel();
        progressInnerEl.style.width = "0%";
        sectionPathEl.textContent = "";
        typeEl.textContent = "empty";
        languageEl.textContent = "";
        readStatusEl.textContent = "";
        titleEl.textContent = "";
        contentEl.textContent = cards.length
          ? "No cards match the current filter."
          : "No readable Markdown content.";
        contentEl.className = "content";
        imageFigureEl.hidden = true;
        imageContentEl.removeAttribute("src");
        imageCaptionEl.textContent = "";
        tableContentEl.hidden = true;
        tableContentEl.textContent = "";
        prevButton.disabled = true;
        nextButton.disabled = true;
        revealButton.disabled = true;
        bookmarkButton.disabled = true;
        bookmarkFilterButton.disabled = bookmarkedCardIds.size === 0;
        bookmarkFilterButton.classList.toggle("active", showBookmarksOnly);
        collapseButton.disabled = true;
        renderSections();
        renderSearchState();
        return;
      }

      if (!visibleIndexes.includes(index)) {
        index = visibleIndexes[0];
      }

      const card = cards[index];
      readCardIds.add(card.id);
      const visiblePosition = visibleIndexes.indexOf(index);
      const readVisibleCount = visibleIndexes.filter((cardIndex) =>
        readCardIds.has(cards[cardIndex].id)
      ).length;

      counterEl.textContent =
        String(visiblePosition + 1) +
        " / " +
        String(visibleIndexes.length) +
        " · read " +
        String(readVisibleCount);
      statsEl.textContent = getStatsLabel();
      progressInnerEl.style.width = String(((visiblePosition + 1) / visibleIndexes.length) * 100) + "%";
      sectionPathEl.textContent = card.sectionPath && card.sectionPath.length
        ? card.sectionPath.join(" > ")
        : "";
      typeEl.textContent = card.type;
      languageEl.textContent = getLanguageLabel(card);
      readStatusEl.textContent = readCardIds.has(card.id) ? "read" : "";
      titleEl.textContent = card.type === "heading" ? "" : card.title || "";
      contentEl.textContent = getCardContent(card);
      contentEl.className = "content " + card.type;
      renderImage(card);
      renderTable(card);
      if (card.type === "code" && codeWrap) {
        contentEl.classList.add("wrap");
      }
      if (isCodeCollapsed(card)) {
        contentEl.classList.add("collapsed");
      }

      prevButton.disabled = visiblePosition === 0;
      nextButton.disabled = visiblePosition === visibleIndexes.length - 1;
      revealButton.disabled = false;
      bookmarkButton.disabled = false;
      bookmarkButton.classList.toggle("active", bookmarkedCardIds.has(card.id));
      bookmarkButton.textContent = bookmarkedCardIds.has(card.id) ? "Bookmarked" : "Bookmark";
      bookmarkFilterButton.disabled = bookmarkedCardIds.size === 0;
      bookmarkFilterButton.classList.toggle("active", showBookmarksOnly);
      bookmarkFilterButton.textContent = showBookmarksOnly ? "All Cards" : "Bookmarks";
      collapseButton.disabled = card.type !== "code";
      collapseButton.classList.toggle("active", isCodeCollapsed(card));
      collapseButton.textContent = isCodeCollapsed(card) ? "Expand Code" : "Collapse Code";
      wrapButton.classList.toggle("active", codeWrap);
      renderSections(card);
      renderSearchState();

      vscode.postMessage({
        type: "savePosition",
        index,
        cardId: card.id,
        bookmarkedCardIds: Array.from(bookmarkedCardIds),
        readCardIds: Array.from(readCardIds),
        collapsedCodeCardIds: Array.from(collapsedCodeCardIds),
        typeFilter,
        codeWrap,
        showBookmarksOnly
      });
    }

    function next() {
      const visibleIndexes = getVisibleIndexes();
      const visiblePosition = visibleIndexes.indexOf(index);

      if (visiblePosition >= 0 && visiblePosition < visibleIndexes.length - 1) {
        goToIndex(visibleIndexes[visiblePosition + 1]);
      }
    }

    function previous() {
      const visibleIndexes = getVisibleIndexes();
      const visiblePosition = visibleIndexes.indexOf(index);

      if (visiblePosition > 0) {
        goToIndex(visibleIndexes[visiblePosition - 1]);
      }
    }

    function revealSource() {
      vscode.postMessage({
        type: "revealSource",
        index
      });
    }

    function goToIndex(nextIndex) {
      index = Math.max(0, Math.min(nextIndex, cards.length - 1));
      render();
    }

    function getVisibleIndexes() {
      return cards
        .map((card, cardIndex) => ({ card, cardIndex }))
        .filter(({ card }) => typeFilter === "all" || card.type === typeFilter)
        .filter(({ card }) => !showBookmarksOnly || bookmarkedCardIds.has(card.id))
        .map(({ cardIndex }) => cardIndex);
    }

    function getStatsLabel() {
      const totalWords = cards.reduce((total, card) => total + getCardWordCount(card), 0);
      const totalChars = cards.reduce((total, card) => total + (card.meta && card.meta.charCount ? card.meta.charCount : card.content.length), 0);
      const visibleCount = getVisibleIndexes().length;
      const parts = [
        String(cards.length) + " cards",
        String(visibleCount) + " visible",
        String(totalWords) + " words",
        String(totalChars) + " chars"
      ];

      if (bookmarkedCardIds.size > 0) {
        parts.push(String(bookmarkedCardIds.size) + " bookmarks");
      }

      return parts.join(" · ");
    }

    function getCardWordCount(card) {
      if (card.meta && typeof card.meta.wordCount === "number") {
        return card.meta.wordCount;
      }

      return card.content.trim().split(/\\s+/u).filter(Boolean).length;
    }

    function getCardContent(card) {
      if (isCodeCollapsed(card)) {
        const lineCount = card.content.split("\\n").length;
        return "Code block collapsed · " + String(lineCount) + " lines";
      }

      if (card.type === "image" && card.meta && card.meta.imageWebviewUri) {
        return "";
      }

      if (card.type === "image" && card.meta && card.meta.imageUrl) {
        return card.content + "\\n" + card.meta.imageUrl;
      }

      if (card.type === "table" && parseMarkdownTable(card.content)) {
        return "";
      }

      return card.content;
    }

    function renderImage(card) {
      const imageUri = card.meta && card.meta.imageWebviewUri;

      if (card.type !== "image" || !imageUri) {
        imageFigureEl.hidden = true;
        imageContentEl.removeAttribute("src");
        imageCaptionEl.textContent = "";
        return;
      }

      imageContentEl.src = imageUri;
      imageContentEl.alt = card.content || "Markdown image";
      imageCaptionEl.textContent = card.content || (card.meta && card.meta.imageUrl) || "";
      imageFigureEl.hidden = false;
    }

    function renderTable(card) {
      tableContentEl.textContent = "";
      const parsedTable = card.type === "table" ? parseMarkdownTable(card.content) : undefined;

      if (!parsedTable) {
        tableContentEl.hidden = true;
        return;
      }

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");

      for (const header of parsedTable.headers) {
        const th = document.createElement("th");
        th.textContent = header;
        headRow.appendChild(th);
      }

      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      for (const row of parsedTable.rows) {
        const tr = document.createElement("tr");

        for (const cell of row) {
          const td = document.createElement("td");
          td.textContent = cell;
          tr.appendChild(td);
        }

        tbody.appendChild(tr);
      }

      table.appendChild(tbody);
      tableContentEl.appendChild(table);
      tableContentEl.hidden = false;
    }

    function parseMarkdownTable(content) {
      const rows = content
        .split("\\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("|") && line.endsWith("|"))
        .map(splitTableRow);

      if (rows.length < 2 || !isSeparatorRow(rows[1])) {
        return undefined;
      }

      const headers = rows[0];
      const bodyRows = rows.slice(2).map((row) => normalizeTableRow(row, headers.length));

      return {
        headers,
        rows: bodyRows
      };
    }

    function splitTableRow(line) {
      return line
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim());
    }

    function isSeparatorRow(row) {
      return row.every((cell) => /^:?-{3,}:?$/u.test(cell));
    }

    function normalizeTableRow(row, size) {
      const normalized = row.slice(0, size);

      while (normalized.length < size) {
        normalized.push("");
      }

      return normalized;
    }

    function getLanguageLabel(card) {
      if (card.meta && card.meta.isMermaid) {
        return "mermaid";
      }

      return card.meta && card.meta.language ? card.meta.language : "";
    }

    function isCodeCollapsed(card) {
      return card && card.type === "code" && collapsedCodeCardIds.has(card.id);
    }

    function toggleBookmark() {
      const card = cards[index];

      if (!card) {
        return;
      }

      if (bookmarkedCardIds.has(card.id)) {
        bookmarkedCardIds.delete(card.id);
      } else {
        bookmarkedCardIds.add(card.id);
      }

      render();
    }

    function toggleBookmarkFilter() {
      showBookmarksOnly = !showBookmarksOnly;
      updateSearch();
      render();
    }

    function toggleCodeWrap() {
      codeWrap = !codeWrap;
      render();
    }

    function toggleCodeCollapse() {
      const card = cards[index];

      if (!card || card.type !== "code") {
        return;
      }

      if (collapsedCodeCardIds.has(card.id)) {
        collapsedCodeCardIds.delete(card.id);
      } else {
        collapsedCodeCardIds.add(card.id);
      }

      render();
    }

    function renderTypeFilter() {
      const types = Array.from(new Set(cards.map((card) => card.type))).sort();
      const values = ["all", ...types];

      if (!values.includes(typeFilter)) {
        typeFilter = "all";
      }

      const currentValue = typeFilterEl.value || typeFilter;
      typeFilterEl.textContent = "";

      for (const value of values) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value === "all" ? "All cards" : value;
        typeFilterEl.appendChild(option);
      }

      typeFilterEl.value = values.includes(currentValue) ? currentValue : typeFilter;
      typeFilter = typeFilterEl.value;
    }

    function renderSections(currentCard) {
      const currentValue = sectionSelect.value;
      const sections = [];
      const seen = new Set();
      const visibleIndexes = getVisibleIndexes();

      for (const cardIndex of visibleIndexes) {
        const card = cards[cardIndex];
        const label = card.sectionPath && card.sectionPath.length
          ? card.sectionPath.join(" > ")
          : card.type === "heading"
            ? card.content
            : "Document start";

        if (!seen.has(label)) {
          seen.add(label);
          sections.push({ label, index: cardIndex });
        }
      }

      sectionSelect.textContent = "";

      for (const section of sections) {
        const option = document.createElement("option");
        option.value = String(section.index);
        option.textContent = section.label;
        sectionSelect.appendChild(option);
      }

      if (currentCard) {
        const currentLabel = currentCard.sectionPath && currentCard.sectionPath.length
          ? currentCard.sectionPath.join(" > ")
          : "Document start";
        const section = sections.find((entry) => entry.label === currentLabel);
        sectionSelect.value = String(section ? section.index : index);
      } else {
        sectionSelect.value = currentValue;
      }
    }

    function updateSearch() {
      searchQuery = searchInput.value.trim().toLowerCase();

      if (!searchQuery) {
        searchMatches = [];
        renderSearchState();
        return;
      }

      searchMatches = getVisibleIndexes()
        .map((cardIndex) => ({ card: cards[cardIndex], cardIndex }))
        .filter(({ card }) => {
          const haystack = [
            card.content,
            card.title || "",
            card.type,
            card.sectionPath ? card.sectionPath.join(" ") : ""
          ].join(" ").toLowerCase();

          return haystack.includes(searchQuery);
        })
        .map(({ cardIndex }) => cardIndex);

      renderSearchState();
    }

    function renderSearchState() {
      if (!searchQuery) {
        matchCountEl.textContent = "";
        prevMatchButton.disabled = true;
        nextMatchButton.disabled = true;
        return;
      }

      const currentMatchIndex = searchMatches.indexOf(index);
      const visibleMatchIndex = currentMatchIndex >= 0
        ? currentMatchIndex + 1
        : searchMatches.filter((matchIndex) => matchIndex <= index).length;

      matchCountEl.textContent = searchMatches.length
        ? String(Math.max(1, visibleMatchIndex)) + " / " + String(searchMatches.length)
        : "0 / 0";
      prevMatchButton.disabled = searchMatches.length === 0;
      nextMatchButton.disabled = searchMatches.length === 0;
    }

    function goToNextMatch(direction) {
      if (!searchMatches.length) {
        return;
      }

      const sortedMatches = direction > 0 ? searchMatches : [...searchMatches].reverse();
      const nextMatch = sortedMatches.find((matchIndex) =>
        direction > 0 ? matchIndex > index : matchIndex < index
      );

      goToIndex(nextMatch === undefined ? sortedMatches[0] : nextMatch);
    }

    prevButton.addEventListener("click", previous);
    nextButton.addEventListener("click", next);
    revealButton.addEventListener("click", revealSource);
    bookmarkButton.addEventListener("click", toggleBookmark);
    bookmarkFilterButton.addEventListener("click", toggleBookmarkFilter);
    collapseButton.addEventListener("click", toggleCodeCollapse);
    wrapButton.addEventListener("click", toggleCodeWrap);
    searchInput.addEventListener("input", updateSearch);
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        goToNextMatch(event.shiftKey ? -1 : 1);
      }
    });
    prevMatchButton.addEventListener("click", () => goToNextMatch(-1));
    nextMatchButton.addEventListener("click", () => goToNextMatch(1));
    sectionSelect.addEventListener("change", () => goToIndex(Number(sectionSelect.value)));
    typeFilterEl.addEventListener("change", () => {
      typeFilter = typeFilterEl.value;
      updateSearch();
      render();
    });

    window.addEventListener("keydown", (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLSelectElement;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
        return;
      }

      if (isTyping) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " ") {
        event.preventDefault();
        next();
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        previous();
      }

      if (event.key === "Home") {
        event.preventDefault();
        goToIndex(getVisibleIndexes()[0] ?? 0);
      }

      if (event.key === "End") {
        event.preventDefault();
        const visibleIndexes = getVisibleIndexes();
        goToIndex(visibleIndexes[visibleIndexes.length - 1] ?? cards.length - 1);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        revealSource();
      }

      if (event.key === "/") {
        event.preventDefault();
        searchInput.focus();
      }

      if (event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleBookmark();
      }

      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleBookmarkFilter();
      }

      if (event.key.toLowerCase() === "w") {
        event.preventDefault();
        toggleCodeWrap();
      }

      if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        toggleCodeCollapse();
      }
    });

    window.addEventListener("message", (event) => {
      const message = event.data;

      if (message.type === "updateCards") {
        const currentCard = cards[index];
        cards = Array.isArray(message.cards) ? message.cards : [];
        bookmarkedCardIds = new Set(
          Array.from(bookmarkedCardIds).filter((cardId) => cards.some((card) => card.id === cardId))
        );
        readCardIds = new Set(
          Array.from(readCardIds).filter((cardId) => cards.some((card) => card.id === cardId))
        );
        collapsedCodeCardIds = new Set(
          Array.from(collapsedCodeCardIds).filter((cardId) =>
            cards.some((card) => card.id === cardId && card.type === "code")
          )
        );

        if (currentCard) {
          const nextIndex = cards.findIndex((card) => card.id === currentCard.id);
          index = nextIndex >= 0 ? nextIndex : Math.min(index, cards.length - 1);
        } else {
          index = 0;
        }

        updateSearch();
        render();
      }
    });

    updateSearch();
    render();
  </script>
</body>
</html>`;
}
