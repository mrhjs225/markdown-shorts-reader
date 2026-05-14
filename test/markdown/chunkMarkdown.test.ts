import { describe, expect, it } from "vitest";
import { chunkMarkdown } from "../../src/markdown/chunkMarkdown";

describe("chunkMarkdown", () => {
  it("creates heading and paragraph cards", () => {
    const markdown = `# Hello

This is a paragraph with enough words to stand on its own in the reader.
`;

    const cards = chunkMarkdown(markdown);

    expect(cards[0]).toMatchObject({
      type: "heading",
      content: "Hello",
      level: 1,
      startLine: 0,
      endLine: 0
    });
    expect(cards[1]).toMatchObject({
      type: "paragraph",
      startLine: 2,
      endLine: 2,
      sectionPath: ["Hello"]
    });
  });

  it("keeps code blocks as separate cards", () => {
    const markdown = `# Example

\`\`\`ts
const value = 1;
\`\`\`

After the code block.
`;

    const cards = chunkMarkdown(markdown);
    const codeCard = cards.find((card) => card.type === "code");

    expect(codeCard).toBeDefined();
    expect(codeCard?.content).toContain("const value = 1");
    expect(codeCard?.meta?.language).toBe("ts");
    expect(codeCard?.startLine).toBe(2);
  });

  it("marks Mermaid code blocks in metadata", () => {
    const markdown = `# Diagram

\`\`\`mermaid
graph TD
  A --> B
\`\`\`
`;

    const cards = chunkMarkdown(markdown);
    const codeCard = cards.find((card) => card.type === "code");

    expect(codeCard?.meta?.language).toBe("mermaid");
    expect(codeCard?.meta?.isMermaid).toBe(true);
  });

  it("creates image cards for image-only paragraphs", () => {
    const markdown = `# Screenshot

![Reader UI](./reader.png)
`;

    const cards = chunkMarkdown(markdown);
    const imageCard = cards.find((card) => card.type === "image");

    expect(imageCard).toBeDefined();
    expect(imageCard?.content).toBe("Reader UI");
    expect(imageCard?.meta?.imageUrl).toBe("./reader.png");
    expect(imageCard?.meta?.charCount).toBe("Reader UI".length);
  });

  it("creates list and blockquote cards", () => {
    const markdown = `# Notes

- first
- second

> quoted thought
`;

    const cards = chunkMarkdown(markdown);

    expect(cards.some((card) => card.type === "list" && card.content.includes("first"))).toBe(true);
    expect(cards.some((card) => card.type === "blockquote")).toBe(true);
  });

  it("creates table cards from GFM tables", () => {
    const markdown = `# Data

| Name | Value |
| --- | --- |
| One | 1 |
`;

    const cards = chunkMarkdown(markdown);
    const tableCard = cards.find((card) => card.type === "table");

    expect(tableCard).toBeDefined();
    expect(tableCard?.content).toContain("| Name | Value |");
    expect(tableCard?.startLine).toBe(2);
    expect(tableCard?.endLine).toBe(4);
    expect(tableCard?.meta?.wordCount).toBeGreaterThan(0);
  });

  it("keeps long tables as a single table card without splitting or merging", () => {
    const headerLines = ["| File | Class/Function | Description |", "| --- | --- | --- |"];
    const rowLines = Array.from({ length: 20 }, (_, index) => {
      const filler = "x".repeat(80);
      return `| src/file_${index}.py | doThing${index}() | ${filler} |`;
    });
    const markdown = `### Main files

${[...headerLines, ...rowLines].join("\n")}

Trailing paragraph.
`;

    const cards = chunkMarkdown(markdown);
    const tableCards = cards.filter((card) => card.type === "table");

    expect(tableCards).toHaveLength(1);
    const tableCard = tableCards[0];
    expect(tableCard.content.length).toBeGreaterThan(1000);
    expect(tableCard.content).toContain("| File | Class/Function | Description |");
    expect(tableCard.content).toContain("| --- | --- | --- |");
    expect(tableCard.content.split("\n").length).toBeGreaterThan(headerLines.length + rowLines.length - 1);
    expect(cards.some((card) => card.type === "mixed" && card.content.includes("|"))).toBe(false);
  });

  it("adds a document review card for heading jumps and empty sections", () => {
    const markdown = `# Intro

### Jumped

Some body content.

## Empty

## Next

More body content.
`;

    const cards = chunkMarkdown(markdown);
    const reviewCard = cards.find((card) => card.type === "review");

    expect(reviewCard).toBeDefined();
    expect(reviewCard?.content).toContain('Heading "Jumped" jumps from H1 to H3');
    expect(reviewCard?.content).toContain('Section "Empty" has no body content');
  });

  it("merges short paragraph cards in the same section", () => {
    const markdown = `# Intro

Short one.

Short two.

## Next

Short three.
`;

    const cards = chunkMarkdown(markdown, {
      minCardChars: 120,
      maxCardChars: 700
    });
    const introCard = cards.find(
      (card) => card.type === "paragraph" && card.sectionPath.join("/") === "Intro"
    );

    expect(introCard?.content).toContain("Short one.");
    expect(introCard?.content).toContain("Short two.");
    expect(introCard?.content).not.toContain("Short three.");
  });

  it("splits long paragraph cards", () => {
    const sentence = "This sentence is intentionally repetitive so the test has stable length. ";
    const markdown = `# Long

${sentence.repeat(30)}
`;

    const cards = chunkMarkdown(markdown, {
      longCardChars: 500
    });
    const paragraphCards = cards.filter((card) => card.type === "paragraph");

    expect(paragraphCards.length).toBeGreaterThan(1);
    expect(paragraphCards.every((card) => card.content.length <= 700)).toBe(true);
  });
});
