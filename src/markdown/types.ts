export type ReadingCardType =
  | "heading"
  | "paragraph"
  | "code"
  | "list"
  | "blockquote"
  | "image"
  | "table"
  | "thematicBreak"
  | "review"
  | "mixed";

export type ReadingCard = {
  id: string;
  type: ReadingCardType;
  title?: string;
  content: string;
  level?: number;
  startLine: number;
  endLine: number;
  sectionPath: string[];
  meta?: {
    language?: string;
    imageUrl?: string;
    imageWebviewUri?: string;
    wordCount?: number;
    charCount?: number;
    isLong?: boolean;
    isMermaid?: boolean;
  };
};

export type ReadingSession = {
  documentUri: string;
  documentVersion: number;
  cards: ReadingCard[];
  currentIndex: number;
  createdAt: number;
  updatedAt: number;
};

export type StoredReadingState = {
  documentUri: string;
  currentCardId?: string;
  currentIndex: number;
  bookmarkedCardIds?: string[];
  readCardIds?: string[];
  collapsedCodeCardIds?: string[];
  typeFilter?: ReadingCardType | "all";
  codeWrap?: boolean;
  showBookmarksOnly?: boolean;
  tocOpen?: boolean;
  focusMode?: boolean;
  updatedAt: number;
};

export type ChunkMarkdownOptions = {
  minCardChars?: number;
  maxCardChars?: number;
  longCardChars?: number;
};
