import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { extractText } from "./extractText";
import { splitLongCards } from "./splitLongCard";
import type { ChunkMarkdownOptions, ReadingCard, ReadingCardType } from "./types";

type MarkdownNode = {
  type: string;
  depth?: number;
  lang?: string;
  url?: string;
  alt?: string;
  value?: string;
  children?: MarkdownNode[];
  position?: {
    start?: {
      line?: number;
    };
    end?: {
      line?: number;
    };
  };
};

const DEFAULT_MIN_CARD_CHARS = 120;
const DEFAULT_MAX_CARD_CHARS = 700;
const DEFAULT_LONG_CARD_CHARS = 1000;

export function chunkMarkdown(markdown: string, options: ChunkMarkdownOptions = {}): ReadingCard[] {
  const minCardChars = options.minCardChars ?? DEFAULT_MIN_CARD_CHARS;
  const maxCardChars = options.maxCardChars ?? DEFAULT_MAX_CARD_CHARS;
  const longCardChars = options.longCardChars ?? DEFAULT_LONG_CARD_CHARS;
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as {
    children?: MarkdownNode[];
  };
  const sourceLines = markdown.split(/\r?\n/u);
  const rawCards: ReadingCard[] = [];
  const sectionPath: string[] = [];

  for (const node of tree.children ?? []) {
    const card = createCardFromNode(node, sectionPath, sourceLines);

    if (card) {
      rawCards.push(card);
    }
  }

  const splitCards = splitLongCards(rawCards, longCardChars);
  const mergedCards = mergeSmallCards(splitCards, minCardChars, maxCardChars).filter(
    (card) => card.content.trim().length > 0
  );
  const reviewCard = createDocumentReviewCard(rawCards);

  return reviewCard ? [...mergedCards, reviewCard] : mergedCards;
}

function createCardFromNode(
  node: MarkdownNode,
  sectionPath: string[],
  sourceLines: string[]
): ReadingCard | undefined {
  if (node.type === "heading") {
    return createHeadingCard(node, sectionPath);
  }

  if (node.type === "paragraph") {
    if (isImageParagraph(node)) {
      const imageNode = node.children?.[0];
      const content = imageNode?.alt?.trim() || imageNode?.url?.trim() || "Image";

      return createTextCard(node, "image", content, sectionPath, {
        imageUrl: imageNode?.url
      });
    }

    const content = extractText(node).trim();

    return createTextCard(node, "paragraph", content, sectionPath);
  }

  if (node.type === "code") {
    const content = node.value ?? "";

    return createTextCard(node, "code", content, sectionPath, {
      language: node.lang,
      isMermaid: node.lang?.toLowerCase() === "mermaid",
      isLong: content.length > 1200
    });
  }

  if (node.type === "list") {
    return createTextCard(node, "list", getSourceForNode(node, sourceLines), sectionPath);
  }

  if (node.type === "blockquote") {
    return createTextCard(node, "blockquote", getSourceForNode(node, sourceLines), sectionPath);
  }

  if (node.type === "thematicBreak") {
    return createTextCard(node, "thematicBreak", "---", sectionPath);
  }

  if (node.type === "table") {
    return createTextCard(node, "table", getSourceForNode(node, sourceLines), sectionPath);
  }

  if (node.type === "html") {
    return createTextCard(node, "mixed", node.value?.trim() ?? "", sectionPath);
  }

  return undefined;
}

function createHeadingCard(node: MarkdownNode, sectionPath: string[]): ReadingCard {
  const title = extractText(node).trim();
  const level = Math.max(1, Math.min(node.depth ?? 1, 6));

  sectionPath.length = level - 1;
  sectionPath[level - 1] = title;

  const card: ReadingCard = {
    id: createCardId("heading", title, getStartLine(node), getEndLine(node)),
    type: "heading",
    title,
    content: title,
    level,
    startLine: getStartLine(node),
    endLine: getEndLine(node),
    sectionPath: [...sectionPath],
    meta: {
      charCount: title.length,
      wordCount: countWords(title)
    }
  };

  return card;
}

function createTextCard(
  node: MarkdownNode,
  type: ReadingCardType,
  content: string,
  sectionPath: string[],
  meta: ReadingCard["meta"] = {}
): ReadingCard {
  const startLine = getStartLine(node);
  const endLine = getEndLine(node);

  return {
    id: createCardId(type, content, startLine, endLine),
    type,
    title: getCurrentSectionTitle(sectionPath),
    content,
    startLine,
    endLine,
    sectionPath: [...sectionPath],
    meta: {
      ...meta,
      charCount: content.length,
      wordCount: countWords(content)
    }
  };
}

function mergeSmallCards(
  cards: ReadingCard[],
  minCardChars: number,
  maxCardChars: number
): ReadingCard[] {
  const result: ReadingCard[] = [];
  let buffer: ReadingCard | undefined;

  for (const card of cards) {
    if (shouldNeverMerge(card)) {
      flush();
      result.push(card);
      continue;
    }

    if (!buffer) {
      buffer = card;
      continue;
    }

    if (shouldTryMerge(buffer, minCardChars) && canMerge(buffer, card, maxCardChars)) {
      buffer = mergeCards(buffer, card);
    } else {
      flush();
      buffer = card;
    }
  }

  flush();
  return result;

  function flush() {
    if (buffer) {
      result.push(buffer);
      buffer = undefined;
    }
  }
}

function shouldTryMerge(card: ReadingCard, minCardChars: number): boolean {
  return card.content.length < minCardChars || card.type === "mixed";
}

function shouldNeverMerge(card: ReadingCard): boolean {
  return (
    card.type === "heading" ||
    card.type === "code" ||
    card.type === "image" ||
    card.type === "table" ||
    card.type === "thematicBreak" ||
    card.type === "review"
  );
}

function canMerge(previous: ReadingCard, next: ReadingCard, maxChars: number): boolean {
  if (shouldNeverMerge(previous) || shouldNeverMerge(next)) {
    return false;
  }

  if (previous.type === "blockquote" || next.type === "blockquote") {
    return previous.type === next.type && sameSection(previous, next);
  }

  if (!sameSection(previous, next)) {
    return false;
  }

  const combinedLength = previous.content.length + next.content.length + 2;
  return combinedLength <= maxChars;
}

function sameSection(previous: ReadingCard, next: ReadingCard): boolean {
  return previous.sectionPath.join("/") === next.sectionPath.join("/");
}

function mergeCards(previous: ReadingCard, next: ReadingCard): ReadingCard {
  const content = `${previous.content}\n\n${next.content}`;

  return {
    ...previous,
    id: `${previous.id}_${next.id}`,
    type: previous.type === next.type ? previous.type : "mixed",
    content,
    endLine: next.endLine,
    meta: {
      ...previous.meta,
      charCount: content.length,
      wordCount: countWords(content)
    }
  };
}

function getCurrentSectionTitle(sectionPath: string[]): string | undefined {
  return sectionPath.at(-1);
}

function getStartLine(node: MarkdownNode): number {
  return Math.max((node.position?.start?.line ?? 1) - 1, 0);
}

function getEndLine(node: MarkdownNode): number {
  return Math.max((node.position?.end?.line ?? 1) - 1, 0);
}

function isImageParagraph(node: MarkdownNode): boolean {
  return node.children?.length === 1 && node.children[0]?.type === "image";
}

function getSourceForNode(node: MarkdownNode, sourceLines: string[]): string {
  const startLine = getStartLine(node);
  const endLine = getEndLine(node);

  return sourceLines
    .slice(startLine, endLine + 1)
    .join("\n")
    .trim();
}

function countWords(content: string): number {
  return content.trim().split(/\s+/u).filter(Boolean).length;
}

function createCardId(type: string, content: string, startLine: number, endLine: number): string {
  return `${type}-${startLine}-${endLine}-${hashString(content)}`;
}

function createDocumentReviewCard(cards: ReadingCard[]): ReadingCard | undefined {
  const issues = [
    ...findHeadingLevelIssues(cards),
    ...findEmptySectionIssues(cards),
    ...findOversizedSectionIssues(cards)
  ];

  if (issues.length === 0) {
    return undefined;
  }

  const shownIssues = issues.slice(0, 12);
  const hiddenCount = issues.length - shownIssues.length;
  const content = [
    "Document review",
    "",
    ...shownIssues.map((issue) => `- Line ${issue.line + 1}: ${issue.message}`),
    ...(hiddenCount > 0 ? [`- ${hiddenCount} more issue(s) not shown.`] : [])
  ].join("\n");

  return {
    id: createCardId("review", content, 0, 0),
    type: "review",
    title: "Document Review",
    content,
    startLine: shownIssues[0]?.line ?? 0,
    endLine: shownIssues[0]?.line ?? 0,
    sectionPath: ["Document Review"],
    meta: {
      charCount: content.length,
      wordCount: countWords(content)
    }
  };
}

function findHeadingLevelIssues(cards: ReadingCard[]): Array<{ line: number; message: string }> {
  const issues: Array<{ line: number; message: string }> = [];
  let previousLevel = 0;

  for (const card of cards) {
    if (card.type !== "heading" || !card.level) {
      continue;
    }

    if (previousLevel > 0 && card.level > previousLevel + 1) {
      issues.push({
        line: card.startLine,
        message: `Heading "${card.content}" jumps from H${previousLevel} to H${card.level}.`
      });
    }

    previousLevel = card.level;
  }

  return issues;
}

function findEmptySectionIssues(cards: ReadingCard[]): Array<{ line: number; message: string }> {
  return cards
    .filter((card) => card.type === "heading")
    .filter((heading) => !sectionHasBody(cards, heading))
    .map((heading) => ({
      line: heading.startLine,
      message: `Section "${heading.content}" has no body content.`
    }));
}

function findOversizedSectionIssues(cards: ReadingCard[]): Array<{ line: number; message: string }> {
  const maxSectionChars = 5000;

  return cards
    .filter((card) => card.type === "heading")
    .map((heading) => ({
      heading,
      charCount: getSectionCards(cards, heading).reduce(
        (total, card) => total + (card.meta?.charCount ?? card.content.length),
        0
      )
    }))
    .filter(({ charCount }) => charCount > maxSectionChars)
    .map(({ heading, charCount }) => ({
      line: heading.startLine,
      message: `Section "${heading.content}" is large (${charCount} characters). Consider splitting it.`
    }));
}

function sectionHasBody(cards: ReadingCard[], heading: ReadingCard): boolean {
  return getSectionCards(cards, heading).some(
    (card) => card.type !== "heading" && card.type !== "thematicBreak"
  );
}

function getSectionCards(cards: ReadingCard[], heading: ReadingCard): ReadingCard[] {
  const startIndex = cards.indexOf(heading);

  if (startIndex < 0) {
    return [];
  }

  const result: ReadingCard[] = [];

  for (let index = startIndex + 1; index < cards.length; index += 1) {
    const card = cards[index];

    if (card.type === "heading" && (card.level ?? 1) <= (heading.level ?? 1)) {
      break;
    }

    result.push(card);
  }

  return result;
}

function hashString(value: string): string {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}
