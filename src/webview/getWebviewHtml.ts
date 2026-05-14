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
  initialTocOpen?: boolean;
  initialFocusMode?: boolean;
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
    initialShowBookmarksOnly = false,
    initialTocOpen = false,
    initialFocusMode = false
  } = options;
  const nonce = getNonce();
  const safeCardsJson = JSON.stringify(cards).replace(/</g, "\\u003c");
  const safeBookmarksJson = JSON.stringify(initialBookmarkedCardIds).replace(/</g, "\\u003c");
  const safeReadJson = JSON.stringify(initialReadCardIds).replace(/</g, "\\u003c");
  const safeCollapsedJson = JSON.stringify(initialCollapsedCodeCardIds).replace(/</g, "\\u003c");
  const safeTypeFilterJson = JSON.stringify(initialTypeFilter).replace(/</g, "\\u003c");
  const safeCodeWrapJson = JSON.stringify(Boolean(initialCodeWrap));
  const safeShowBookmarksOnlyJson = JSON.stringify(Boolean(initialShowBookmarksOnly));
  const safeTocOpenJson = JSON.stringify(Boolean(initialTocOpen));
  const safeFocusModeJson = JSON.stringify(Boolean(initialFocusMode));
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
      min-height: 40px;
      padding: 0 16px;
    }

    .brand {
      font-weight: 700;
    }

    .counter {
      color: var(--vscode-descriptionForeground);
      font-variant-numeric: tabular-nums;
    }

    .counter-wrap {
      cursor: default;
      position: relative;
    }

    .counter-wrap:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: 2px;
      border-radius: 4px;
    }

    .counter-popover {
      background: var(--vscode-editorHoverWidget-background, var(--vscode-editorWidget-background));
      border: 1px solid var(--vscode-editorHoverWidget-border, var(--vscode-panel-border));
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
      color: var(--vscode-editorHoverWidget-foreground, var(--vscode-editor-foreground));
      font-size: 12px;
      opacity: 0;
      padding: 8px 12px;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: calc(100% + 6px);
      transition: opacity 120ms ease-out;
      white-space: nowrap;
      z-index: 5;
    }

    .counter-wrap:hover .counter-popover,
    .counter-wrap:focus-within .counter-popover {
      opacity: 1;
    }

    .stats {
      color: var(--vscode-descriptionForeground);
      font-variant-numeric: tabular-nums;
    }

    .tools {
      align-items: center;
      border-bottom: 1px solid var(--vscode-panel-border);
      column-gap: 12px;
      display: flex;
      flex-wrap: wrap;
      padding: 8px 16px;
      row-gap: 8px;
    }

    .tool-group {
      align-items: center;
      display: flex;
      gap: 6px;
    }

    .tool-group-search {
      flex: 1;
      min-width: 200px;
    }

    .tool-group-sep {
      background: var(--vscode-panel-border);
      height: 20px;
      opacity: 0.5;
      width: 1px;
    }

    .search-match-controls {
      align-items: center;
      display: none;
      gap: 4px;
    }

    .tools.has-search .search-match-controls {
      display: inline-flex;
    }

    .icon-button {
      min-width: 32px;
      padding: 0 8px;
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
    }

    .search-field {
      flex: 1;
      min-width: 120px;
    }

    .section-select {
      max-width: 240px;
      min-width: 150px;
    }

    .type-filter {
      max-width: 160px;
      min-width: 116px;
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
      cursor: pointer;
      height: 6px;
      position: relative;
    }

    .progress:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: 1px;
    }

    .progress-read {
      background: var(--vscode-progressBar-background);
      bottom: 0;
      left: 0;
      opacity: 0.32;
      position: absolute;
      top: 0;
      transition: width 120ms ease-out;
      width: 0;
    }

    .progress-inner {
      background: var(--vscode-progressBar-background);
      bottom: 0;
      left: 0;
      position: absolute;
      top: 0;
      transition: width 120ms ease-out;
      width: 0;
    }

    .progress-ticks {
      bottom: auto;
      left: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: -3px;
    }

    .progress-tick {
      background: var(--vscode-charts-orange, var(--vscode-progressBar-background));
      border-radius: 50%;
      height: 4px;
      position: absolute;
      top: 0;
      transform: translateX(-50%);
      width: 4px;
    }

    .progress-knob {
      background: var(--vscode-progressBar-background);
      border: 2px solid var(--vscode-editor-background);
      border-radius: 50%;
      height: 10px;
      left: 0;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      transition: left 120ms ease-out;
      width: 10px;
    }

    .viewer {
      display: block;
      min-height: 0;
      overflow: auto;
      padding: 32px 24px 48px;
    }

    .card {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
      border-radius: 12px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin: 0 auto;
      max-width: 820px;
      padding: 32px 36px;
      width: 100%;
    }

    .section-path {
      align-items: center;
      color: var(--vscode-descriptionForeground);
      display: flex;
      flex-wrap: wrap;
      font-size: 12px;
      gap: 0;
      min-height: 16px;
      overflow: hidden;
    }

    .breadcrumb-seg {
      background: transparent;
      border: 0;
      border-radius: 3px;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      font: inherit;
      min-height: auto;
      padding: 1px 4px;
    }

    .breadcrumb-seg:hover {
      color: var(--vscode-textLink-foreground);
      text-decoration: underline;
    }

    .breadcrumb-seg:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: 1px;
    }

    .breadcrumb-sep {
      color: var(--vscode-descriptionForeground);
      opacity: 0.55;
      padding: 0 2px;
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

    .type[data-type="code"] {
      border-color: var(--vscode-charts-purple, var(--vscode-badge-background));
      color: var(--vscode-charts-purple, var(--vscode-badge-foreground));
    }

    .type[data-type="table"] {
      border-color: var(--vscode-charts-green, var(--vscode-badge-background));
      color: var(--vscode-charts-green, var(--vscode-badge-foreground));
    }

    .type[data-type="image"] {
      border-color: var(--vscode-charts-blue, var(--vscode-badge-background));
      color: var(--vscode-charts-blue, var(--vscode-badge-foreground));
    }

    .type[data-type="blockquote"] {
      border-color: var(--vscode-charts-orange, var(--vscode-badge-background));
      color: var(--vscode-charts-orange, var(--vscode-badge-foreground));
    }

    .type[data-type="review"] {
      border-color: var(--vscode-charts-yellow, var(--vscode-badge-background));
      color: var(--vscode-charts-yellow, var(--vscode-badge-foreground));
    }

    .type[data-type="heading"] {
      border-color: var(--vscode-editor-foreground);
      color: var(--vscode-editor-foreground);
    }

    .language {
      font-size: 12px;
    }

    .read-status {
      color: var(--vscode-charts-green, var(--vscode-descriptionForeground));
      font-size: 13px;
      font-weight: 700;
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
      letter-spacing: 0.005em;
      line-height: 1.75;
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
      min-height: 48px;
      padding: 8px 16px;
    }

    .footer button:first-child {
      justify-self: start;
    }

    .footer button:last-child {
      justify-self: end;
    }

    .toc-drawer {
      background: var(--vscode-sideBar-background, var(--vscode-editor-background));
      border-right: 1px solid var(--vscode-panel-border);
      bottom: 0;
      box-shadow: 0 0 24px rgba(0, 0, 0, 0.18);
      display: flex;
      flex-direction: column;
      left: 0;
      position: fixed;
      top: 0;
      transform: translateX(-100%);
      transition: transform 180ms ease-out;
      width: min(340px, 85vw);
      z-index: 20;
    }

    .toc-drawer.open {
      transform: translateX(0);
    }

    .toc-drawer[hidden] {
      display: none;
    }

    .toc-scrim {
      background: rgba(0, 0, 0, 0.25);
      inset: 0;
      position: fixed;
      z-index: 19;
    }

    .toc-scrim[hidden] {
      display: none;
    }

    .toc-header {
      align-items: center;
      border-bottom: 1px solid var(--vscode-panel-border);
      display: flex;
      justify-content: space-between;
      padding: 14px 16px;
    }

    .toc-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .toc-tabs {
      border-bottom: 1px solid var(--vscode-panel-border);
      display: flex;
      gap: 4px;
      padding: 8px 12px;
    }

    .toc-tab {
      background: transparent;
      border: 0;
      border-radius: 4px;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      font: inherit;
      min-height: auto;
      padding: 6px 10px;
    }

    .toc-tab:hover {
      background: var(--vscode-list-hoverBackground);
      color: var(--vscode-foreground);
    }

    .toc-tab.active {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }

    .toc-list {
      flex: 1;
      overflow: auto;
      padding: 8px 4px;
    }

    .toc-item {
      align-items: center;
      background: transparent;
      border: 0;
      border-radius: 4px;
      color: var(--vscode-foreground);
      cursor: pointer;
      display: grid;
      font: inherit;
      gap: 8px;
      grid-template-columns: 1fr auto;
      min-height: auto;
      padding: 6px 12px;
      text-align: left;
      width: 100%;
    }

    .toc-item:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .toc-item.current {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }

    .toc-item-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .toc-item-level-1 {
      font-weight: 700;
      padding-left: 12px;
    }

    .toc-item-level-2 {
      padding-left: 24px;
    }

    .toc-item-level-3 {
      color: var(--vscode-descriptionForeground);
      font-size: 13px;
      padding-left: 36px;
    }

    .toc-count {
      background: var(--vscode-badge-background);
      border-radius: 999px;
      color: var(--vscode-badge-foreground);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      padding: 1px 6px;
    }

    .toc-empty {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      padding: 16px;
    }

    .viewer .card {
      transition: opacity 140ms ease-out, transform 160ms ease-out;
    }

    .card.enter-next {
      opacity: 0;
      transform: translateX(12px);
    }

    .card.enter-prev {
      opacity: 0;
      transform: translateX(-12px);
    }

    .focus-toggle-floating {
      background: var(--vscode-button-secondaryBackground);
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 999px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      color: var(--vscode-button-secondaryForeground);
      cursor: pointer;
      display: none;
      font-size: 14px;
      height: 36px;
      position: fixed;
      right: 12px;
      top: 12px;
      width: 36px;
      z-index: 25;
    }

    .focus-toggle-floating:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .app.focus .topbar,
    .app.focus .tools {
      display: none;
    }

    .app.focus .progress {
      height: 3px;
    }

    .app.focus .progress-knob,
    .app.focus .progress-ticks {
      display: none;
    }

    .app.focus .viewer {
      padding-top: 18px;
    }

    .app.focus .footer {
      background: transparent;
      border-top-color: transparent;
      min-height: 40px;
      padding: 6px 16px;
    }

    .app.focus .footer button {
      background: transparent;
      border-color: transparent;
      color: var(--vscode-descriptionForeground);
    }

    .app.focus .footer button:hover {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .app.focus .focus-toggle-floating {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .help-overlay {
      background: rgba(0, 0, 0, 0.4);
      display: grid;
      inset: 0;
      place-items: center;
      position: fixed;
      z-index: 30;
    }

    .help-overlay[hidden] {
      display: none;
    }

    .help-panel {
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-editorWidget-border, var(--vscode-panel-border));
      border-radius: 8px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.32);
      color: var(--vscode-editorWidget-foreground, var(--vscode-editor-foreground));
      max-width: 480px;
      min-width: 320px;
      padding: 18px 22px;
    }

    .help-header {
      align-items: center;
      display: flex;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .help-title {
      font-size: 14px;
      font-weight: 700;
    }

    .help-grid {
      column-gap: 16px;
      display: grid;
      font-size: 13px;
      grid-template-columns: max-content 1fr;
      margin: 0;
      row-gap: 8px;
    }

    .help-grid dt {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .help-grid dd {
      color: var(--vscode-descriptionForeground);
      margin: 0;
    }

    kbd {
      background: var(--vscode-keybindingLabel-background, var(--vscode-badge-background));
      border: 1px solid var(--vscode-keybindingLabel-border, var(--vscode-panel-border));
      border-bottom-color: var(--vscode-keybindingLabel-bottomBorder, var(--vscode-panel-border));
      border-radius: 3px;
      color: var(--vscode-keybindingLabel-foreground, var(--vscode-badge-foreground));
      font-family: var(--vscode-editor-font-family);
      font-size: 11px;
      padding: 1px 6px;
    }

    @media (prefers-reduced-motion: reduce) {
      .viewer .card,
      .progress-inner,
      .progress-read,
      .progress-knob,
      .toc-drawer {
        transition: none !important;
      }

      .card.enter-next,
      .card.enter-prev {
        opacity: 1;
        transform: none;
      }
    }

    @media (max-width: 620px) {
      .tools {
        column-gap: 8px;
      }

      .tool-group-sep {
        display: none;
      }

      .section-select,
      .type-filter {
        max-width: none;
      }

      .viewer {
        padding: 14px 12px 28px;
      }

      .card {
        padding: 20px 18px;
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
      <div class="counter-wrap" tabindex="0" aria-describedby="counterPopover">
        <div id="counter" class="counter"></div>
        <div id="counterPopover" class="counter-popover" role="tooltip">
          <div id="stats" class="stats"></div>
        </div>
      </div>
    </header>
    <div id="progress" class="progress" role="slider" aria-label="Card position" tabindex="0" aria-valuemin="1" aria-valuemax="1" aria-valuenow="1">
      <div id="progressRead" class="progress-read"></div>
      <div id="progressInner" class="progress-inner"></div>
      <div id="progressTicks" class="progress-ticks" aria-hidden="true"></div>
      <div id="progressKnob" class="progress-knob" aria-hidden="true"></div>
    </div>
    <nav class="tools" aria-label="Reader tools">
      <div class="tool-group tool-group-search">
        <input id="searchInput" class="search-field" type="search" placeholder="Search cards" />
        <div class="search-match-controls" aria-hidden="true">
          <button id="prevMatchButton" class="tool-button icon-button" type="button" title="Previous match" aria-label="Previous match">‹</button>
          <button id="nextMatchButton" class="tool-button icon-button" type="button" title="Next match" aria-label="Next match">›</button>
          <span id="matchCount" class="match-count"></span>
        </div>
      </div>
      <div class="tool-group-sep" aria-hidden="true"></div>
      <div class="tool-group">
        <select id="sectionSelect" class="section-select" title="Jump to section"></select>
        <button id="tocButton" class="tool-button icon-button" type="button" title="Toggle outline (T)" aria-label="Toggle outline">☰</button>
      </div>
      <div class="tool-group-sep" aria-hidden="true"></div>
      <div class="tool-group">
        <select id="typeFilter" class="type-filter" title="Filter card type"></select>
        <button id="bookmarkFilterButton" class="tool-button" type="button" title="Show bookmarked cards only (M)">Bookmarked</button>
      </div>
      <div class="tool-group-sep" aria-hidden="true"></div>
      <div class="tool-group">
        <button id="bookmarkButton" class="tool-button icon-button" type="button" title="Toggle bookmark (B)" aria-label="Toggle bookmark">☆</button>
      </div>
      <div class="tool-group-sep" aria-hidden="true"></div>
      <div class="tool-group">
        <button id="collapseButton" class="tool-button icon-button" type="button" title="Collapse code card (C)" aria-label="Collapse code">⌃</button>
        <button id="wrapButton" class="tool-button icon-button" type="button" title="Toggle code wrapping (W)" aria-label="Wrap code">↩</button>
      </div>
      <div class="tool-group-sep" aria-hidden="true"></div>
      <div class="tool-group">
        <button id="focusButton" class="tool-button icon-button" type="button" title="Focus mode (F)" aria-label="Focus mode">◐</button>
        <button id="helpButton" class="tool-button icon-button" type="button" title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">?</button>
      </div>
    </nav>
    <aside id="tocDrawer" class="toc-drawer" aria-label="Table of contents" hidden>
      <div class="toc-header">
        <div class="toc-title">Outline</div>
        <button id="tocCloseButton" class="icon-button" type="button" title="Close (T)" aria-label="Close outline">✕</button>
      </div>
      <div class="toc-tabs" role="tablist">
        <button id="tocTabSections" class="toc-tab active" role="tab" type="button" aria-selected="true">Sections</button>
        <button id="tocTabBookmarks" class="toc-tab" role="tab" type="button" aria-selected="false">Bookmarks</button>
      </div>
      <nav id="tocList" class="toc-list" aria-live="polite"></nav>
    </aside>
    <div id="tocScrim" class="toc-scrim" hidden></div>
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
    <button id="focusFloatingButton" class="focus-toggle-floating" type="button" title="Exit focus mode (F)" aria-label="Exit focus mode">◐</button>
    <div id="helpOverlay" class="help-overlay" role="dialog" aria-modal="true" aria-labelledby="helpTitle" hidden>
      <div class="help-panel">
        <div class="help-header">
          <div id="helpTitle" class="help-title">Keyboard shortcuts</div>
          <button id="helpCloseButton" class="icon-button" type="button" title="Close" aria-label="Close">✕</button>
        </div>
        <dl class="help-grid">
          <dt><kbd>→</kbd> <kbd>↓</kbd> <kbd>Space</kbd></dt>
          <dd>Next card</dd>
          <dt><kbd>←</kbd> <kbd>↑</kbd></dt>
          <dd>Previous card</dd>
          <dt><kbd>Home</kbd> <kbd>End</kbd></dt>
          <dd>First / last card</dd>
          <dt><kbd>Enter</kbd></dt>
          <dd>Reveal source in editor</dd>
          <dt><kbd>/</kbd> <kbd>Ctrl/⌘ + F</kbd></dt>
          <dd>Focus search</dd>
          <dt><kbd>B</kbd></dt>
          <dd>Toggle bookmark</dd>
          <dt><kbd>M</kbd></dt>
          <dd>Bookmarked only</dd>
          <dt><kbd>C</kbd></dt>
          <dd>Collapse code</dd>
          <dt><kbd>W</kbd></dt>
          <dd>Wrap code</dd>
          <dt><kbd>T</kbd></dt>
          <dd>Toggle outline</dd>
          <dt><kbd>F</kbd></dt>
          <dd>Focus mode</dd>
          <dt><kbd>?</kbd></dt>
          <dd>This help</dd>
          <dt><kbd>Esc</kbd></dt>
          <dd>Close overlay / drawer</dd>
        </dl>
      </div>
    </div>
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
    let tocOpen = ${safeTocOpenJson};
    let tocTab = "sections";
    let focusMode = ${safeFocusModeJson};
    let searchQuery = "";
    let searchMatches = [];

    const counterEl = document.getElementById("counter");
    const statsEl = document.getElementById("stats");
    const progressEl = document.getElementById("progress");
    const progressInnerEl = document.getElementById("progressInner");
    const progressReadEl = document.getElementById("progressRead");
    const progressTicksEl = document.getElementById("progressTicks");
    const progressKnobEl = document.getElementById("progressKnob");
    const toolsEl = document.querySelector(".tools");
    const searchInput = document.getElementById("searchInput");
    const prevMatchButton = document.getElementById("prevMatchButton");
    const nextMatchButton = document.getElementById("nextMatchButton");
    const sectionSelect = document.getElementById("sectionSelect");
    const typeFilterEl = document.getElementById("typeFilter");
    const bookmarkButton = document.getElementById("bookmarkButton");
    const bookmarkFilterButton = document.getElementById("bookmarkFilterButton");
    const collapseButton = document.getElementById("collapseButton");
    const wrapButton = document.getElementById("wrapButton");
    const tocButton = document.getElementById("tocButton");
    const focusButton = document.getElementById("focusButton");
    const helpButton = document.getElementById("helpButton");
    const tocDrawer = document.getElementById("tocDrawer");
    const tocScrim = document.getElementById("tocScrim");
    const tocCloseButton = document.getElementById("tocCloseButton");
    const tocTabSections = document.getElementById("tocTabSections");
    const tocTabBookmarks = document.getElementById("tocTabBookmarks");
    const tocList = document.getElementById("tocList");
    const appEl = document.querySelector(".app");
    const focusFloatingButton = document.getElementById("focusFloatingButton");
    const helpOverlay = document.getElementById("helpOverlay");
    const helpCloseButton = document.getElementById("helpCloseButton");
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
        progressReadEl.style.width = "0%";
        progressKnobEl.style.display = "none";
        progressTicksEl.textContent = "";
        progressEl.setAttribute("aria-valuenow", "0");
        progressEl.setAttribute("aria-valuemax", "0");
        progressEl.setAttribute("aria-valuetext", "No cards");
        sectionPathEl.textContent = "";
        typeEl.textContent = "empty";
        typeEl.setAttribute("data-type", "empty");
        languageEl.textContent = "";
        readStatusEl.textContent = "";
        readStatusEl.title = "";
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
        renderToc();
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
      progressReadEl.style.width = String((readVisibleCount / visibleIndexes.length) * 100) + "%";
      progressKnobEl.style.display = "";
      progressKnobEl.style.left = String(((visiblePosition + 0.5) / visibleIndexes.length) * 100) + "%";
      renderProgressTicks(visibleIndexes);
      progressEl.setAttribute("aria-valuemin", "1");
      progressEl.setAttribute("aria-valuemax", String(visibleIndexes.length));
      progressEl.setAttribute("aria-valuenow", String(visiblePosition + 1));
      progressEl.setAttribute(
        "aria-valuetext",
        (card.title || card.type) + " — " + String(visiblePosition + 1) + " of " + String(visibleIndexes.length)
      );
      renderBreadcrumb(card);
      typeEl.textContent = card.type;
      typeEl.setAttribute("data-type", card.type);
      languageEl.textContent = getLanguageLabel(card);
      readStatusEl.textContent = readCardIds.has(card.id) ? "✓" : "";
      readStatusEl.title = readCardIds.has(card.id) ? "Read" : "";
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
      const isCardBookmarked = bookmarkedCardIds.has(card.id);
      bookmarkButton.classList.toggle("active", isCardBookmarked);
      bookmarkButton.textContent = isCardBookmarked ? "★" : "☆";
      bookmarkButton.title = isCardBookmarked ? "Remove bookmark (B)" : "Bookmark this card (B)";
      bookmarkFilterButton.disabled = bookmarkedCardIds.size === 0;
      bookmarkFilterButton.classList.toggle("active", showBookmarksOnly);
      bookmarkFilterButton.title = showBookmarksOnly
        ? "Showing bookmarks only — click for all (M)"
        : "Show bookmarked cards only (M)";
      collapseButton.disabled = card.type !== "code";
      collapseButton.classList.toggle("active", isCodeCollapsed(card));
      collapseButton.title = isCodeCollapsed(card) ? "Expand code (C)" : "Collapse code (C)";
      wrapButton.classList.toggle("active", codeWrap);
      wrapButton.title = codeWrap ? "Stop wrapping code (W)" : "Wrap code (W)";
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
        showBookmarksOnly,
        tocOpen,
        focusMode
      });

      renderToc();
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
      const clamped = Math.max(0, Math.min(nextIndex, cards.length - 1));
      const direction = clamped > index ? "next" : clamped < index ? "prev" : "same";
      index = clamped;

      const cardEl = document.querySelector(".card");
      if (cardEl && direction !== "same") {
        const enterClass = direction === "next" ? "enter-next" : "enter-prev";
        cardEl.classList.add(enterClass);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            cardEl.classList.remove("enter-next", "enter-prev");
          });
        });
      }

      render();
    }

    function jumpToSectionPrefix(prefix) {
      if (!Array.isArray(prefix) || prefix.length === 0) {
        return;
      }

      const targetIndex = cards.findIndex((c) => {
        const sp = c.sectionPath || [];
        return sp.length >= prefix.length && prefix.every((seg, i) => sp[i] === seg);
      });

      if (targetIndex >= 0) {
        goToIndex(targetIndex);
      }
    }

    function renderBreadcrumb(card) {
      sectionPathEl.textContent = "";
      const sectionPath = card.sectionPath || [];

      if (!sectionPath.length) {
        return;
      }

      sectionPath.forEach((segment, idx) => {
        if (idx > 0) {
          const sep = document.createElement("span");
          sep.className = "breadcrumb-sep";
          sep.textContent = "›";
          sectionPathEl.appendChild(sep);
        }

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "breadcrumb-seg";
        btn.textContent = segment;
        btn.title = "Jump to section: " + segment;
        const prefix = sectionPath.slice(0, idx + 1);
        btn.addEventListener("click", () => jumpToSectionPrefix(prefix));
        sectionPathEl.appendChild(btn);
      });
    }

    function renderProgressTicks(visibleIndexes) {
      progressTicksEl.textContent = "";

      if (!visibleIndexes.length || bookmarkedCardIds.size === 0) {
        return;
      }

      visibleIndexes.forEach((cardIndex, position) => {
        const card = cards[cardIndex];
        if (!bookmarkedCardIds.has(card.id)) {
          return;
        }
        const tick = document.createElement("div");
        tick.className = "progress-tick";
        tick.style.left = String(((position + 0.5) / visibleIndexes.length) * 100) + "%";
        tick.title = "Bookmark: " + (card.title || card.type);
        progressTicksEl.appendChild(tick);
      });
    }

    function pickProgressIndex(clientX) {
      const rect = progressEl.getBoundingClientRect();
      if (rect.width <= 0) {
        return undefined;
      }
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const vis = getVisibleIndexes();
      if (!vis.length) {
        return undefined;
      }
      const targetPos = Math.min(vis.length - 1, Math.floor(ratio * vis.length));
      return vis[targetPos];
    }

    let progressDragging = false;
    progressEl.addEventListener("mousedown", (event) => {
      const target = pickProgressIndex(event.clientX);
      if (target === undefined) {
        return;
      }
      progressDragging = true;
      event.preventDefault();
      goToIndex(target);
    });
    window.addEventListener("mousemove", (event) => {
      if (!progressDragging) {
        return;
      }
      const target = pickProgressIndex(event.clientX);
      if (target !== undefined && target !== index) {
        goToIndex(target);
      }
    });
    window.addEventListener("mouseup", () => {
      progressDragging = false;
    });

    function buildTocTree() {
      const seen = new Map();
      const order = [];

      cards.forEach((card, cardIndex) => {
        const path = card.sectionPath || [];

        if (path.length === 0) {
          const key = "__doc_start__";
          if (!seen.has(key)) {
            seen.set(key, {
              key,
              label: card.type === "heading" ? card.content || "Document start" : "Document start",
              level: 1,
              prefix: [],
              firstCardIndex: cardIndex,
              count: 0
            });
            order.push(key);
          }
          seen.get(key).count++;
          return;
        }

        for (let i = 1; i <= path.length; i++) {
          const prefix = path.slice(0, i);
          const key = prefix.join("\\u0000");
          if (!seen.has(key)) {
            seen.set(key, {
              key,
              label: prefix[prefix.length - 1],
              level: Math.min(i, 3),
              prefix,
              firstCardIndex: cardIndex,
              count: 0
            });
            order.push(key);
          }
          seen.get(key).count++;
        }
      });

      return order.map((key) => seen.get(key));
    }

    function getTocBookmarks() {
      return cards
        .map((card, idx) => ({ card, idx }))
        .filter(({ card }) => bookmarkedCardIds.has(card.id));
    }

    function isCurrentTocNode(node, card) {
      const sp = card.sectionPath || [];
      if (!node.prefix || node.prefix.length === 0) {
        return sp.length === 0;
      }
      if (sp.length < node.prefix.length) {
        return false;
      }
      return node.prefix.every((seg, i) => sp[i] === seg);
    }

    function renderToc() {
      if (!tocList) {
        return;
      }

      tocList.textContent = "";
      const currentCard = cards[index];

      if (tocTab === "bookmarks") {
        const entries = getTocBookmarks();
        if (entries.length === 0) {
          const empty = document.createElement("div");
          empty.className = "toc-empty";
          empty.textContent = "No bookmarks yet. Press B on a card to add one.";
          tocList.appendChild(empty);
          return;
        }
        entries.forEach(({ card, idx }) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "toc-item toc-item-level-1";
          if (idx === index) {
            btn.classList.add("current");
          }
          const label = document.createElement("span");
          label.className = "toc-item-label";
          label.textContent =
            card.title ||
            (card.sectionPath && card.sectionPath.length ? card.sectionPath.join(" › ") : "") ||
            card.type;
          btn.appendChild(label);
          btn.addEventListener("click", () => {
            goToIndex(idx);
            if (window.matchMedia("(max-width: 620px)").matches) {
              setTocOpen(false);
            }
          });
          tocList.appendChild(btn);
        });
        return;
      }

      const tree = buildTocTree();
      if (tree.length === 0) {
        const empty = document.createElement("div");
        empty.className = "toc-empty";
        empty.textContent = "No sections to outline.";
        tocList.appendChild(empty);
        return;
      }

      tree.forEach((node) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "toc-item toc-item-level-" + String(node.level);
        if (currentCard && isCurrentTocNode(node, currentCard)) {
          btn.classList.add("current");
        }

        const label = document.createElement("span");
        label.className = "toc-item-label";
        label.textContent = node.label;
        label.title = node.label;
        btn.appendChild(label);

        const count = document.createElement("span");
        count.className = "toc-count";
        count.textContent = String(node.count);
        btn.appendChild(count);

        btn.addEventListener("click", () => {
          if (node.prefix && node.prefix.length > 0) {
            jumpToSectionPrefix(node.prefix);
          } else {
            goToIndex(node.firstCardIndex);
          }
          if (window.matchMedia("(max-width: 620px)").matches) {
            setTocOpen(false);
          }
        });

        tocList.appendChild(btn);
      });
    }

    function applyTocState() {
      tocDrawer.hidden = !tocOpen;
      tocScrim.hidden = !tocOpen;
      tocDrawer.classList.toggle("open", tocOpen);
      tocButton.classList.toggle("active", tocOpen);
    }

    function setTocOpen(open) {
      if (tocOpen === open) {
        return;
      }
      tocOpen = open;
      applyTocState();
      if (tocOpen) {
        renderToc();
      }
      render();
    }

    function toggleToc() {
      setTocOpen(!tocOpen);
    }

    function setTocTab(tab) {
      if (tab !== "sections" && tab !== "bookmarks") {
        return;
      }
      tocTab = tab;
      tocTabSections.classList.toggle("active", tab === "sections");
      tocTabSections.setAttribute("aria-selected", tab === "sections" ? "true" : "false");
      tocTabBookmarks.classList.toggle("active", tab === "bookmarks");
      tocTabBookmarks.setAttribute("aria-selected", tab === "bookmarks" ? "true" : "false");
      renderToc();
    }

    tocButton.addEventListener("click", toggleToc);
    tocCloseButton.addEventListener("click", () => setTocOpen(false));
    tocScrim.addEventListener("click", () => setTocOpen(false));
    tocTabSections.addEventListener("click", () => setTocTab("sections"));
    tocTabBookmarks.addEventListener("click", () => setTocTab("bookmarks"));

    function applyFocusState() {
      appEl.classList.toggle("focus", focusMode);
      focusButton.classList.toggle("active", focusMode);
    }

    function setFocusMode(on) {
      if (focusMode === on) {
        return;
      }
      focusMode = on;
      applyFocusState();
      render();
    }

    function toggleFocus() {
      setFocusMode(!focusMode);
    }

    focusButton.addEventListener("click", toggleFocus);
    focusFloatingButton.addEventListener("click", toggleFocus);

    function isHelpOpen() {
      return !helpOverlay.hidden;
    }

    function showHelp() {
      helpOverlay.hidden = false;
    }

    function hideHelp() {
      helpOverlay.hidden = true;
    }

    function toggleHelp() {
      if (isHelpOpen()) {
        hideHelp();
      } else {
        showHelp();
      }
    }

    helpButton.addEventListener("click", toggleHelp);
    helpCloseButton.addEventListener("click", hideHelp);
    helpOverlay.addEventListener("click", (event) => {
      if (event.target === helpOverlay) {
        hideHelp();
      }
    });

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
      toolsEl.classList.toggle("has-search", Boolean(searchQuery));

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

      if (isHelpOpen()) {
        if (event.key === "Escape") {
          event.preventDefault();
          hideHelp();
        } else if (event.key === "?") {
          event.preventDefault();
          hideHelp();
        }
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

      if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        toggleToc();
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFocus();
      }

      if (event.key === "?") {
        event.preventDefault();
        toggleHelp();
      }

      if (event.key === "Escape") {
        if (isHelpOpen()) {
          event.preventDefault();
          hideHelp();
        } else if (tocOpen) {
          event.preventDefault();
          setTocOpen(false);
        } else if (focusMode) {
          event.preventDefault();
          setFocusMode(false);
        }
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

    applyTocState();
    applyFocusState();
    updateSearch();
    render();
  </script>
</body>
</html>`;
}
