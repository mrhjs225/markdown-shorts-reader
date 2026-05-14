import type { ReadingCard } from "./types";

const SENTENCE_BOUNDARY = /(?<=[.!?。！？]|다\.|요\.|음\.)\s+/u;

export function splitLongCards(cards: ReadingCard[], maxChars = 1000): ReadingCard[] {
  return cards.flatMap((card) => {
    if (
      card.type === "code" ||
      card.type === "image" ||
      card.type === "table" ||
      card.content.length <= maxChars
    ) {
      return [card];
    }

    return splitTextCard(card, Math.max(400, Math.min(700, maxChars)));
  });
}

function splitTextCard(card: ReadingCard, targetChars: number): ReadingCard[] {
  const sentences = splitIntoSentences(card.content);
  const result: ReadingCard[] = [];
  let buffer = "";

  for (const sentence of sentences) {
    const next = buffer ? `${buffer} ${sentence}` : sentence;

    if (next.length > targetChars && buffer.trim().length > 0) {
      result.push(createDerivedCard(card, buffer, result.length));
      buffer = sentence;
    } else {
      buffer = next;
    }
  }

  if (buffer.trim().length > 0) {
    result.push(createDerivedCard(card, buffer, result.length));
  }

  return result.length > 0 ? result : [card];
}

function splitIntoSentences(content: string): string[] {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  const sentences = normalized.split(SENTENCE_BOUNDARY).filter(Boolean);

  if (sentences.length <= 1) {
    return chunkByLength(normalized, 650);
  }

  return sentences;
}

function chunkByLength(content: string, targetChars: number): string[] {
  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < content.length) {
    chunks.push(content.slice(cursor, cursor + targetChars).trim());
    cursor += targetChars;
  }

  return chunks.filter(Boolean);
}

function createDerivedCard(original: ReadingCard, content: string, index: number): ReadingCard {
  return {
    ...original,
    id: `${original.id}-${index + 1}`,
    content,
    type: original.type === "paragraph" ? "paragraph" : "mixed",
    meta: {
      ...original.meta,
      charCount: content.length,
      wordCount: countWords(content),
      isLong: false
    }
  };
}

function countWords(content: string): number {
  return content.trim().split(/\s+/u).filter(Boolean).length;
}
