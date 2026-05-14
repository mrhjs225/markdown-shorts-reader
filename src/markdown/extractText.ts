type MarkdownNode = {
  type?: string;
  value?: unknown;
  alt?: unknown;
  children?: MarkdownNode[];
};

export function extractText(node: MarkdownNode | undefined): string {
  if (!node) {
    return "";
  }

  if (typeof node.value === "string") {
    return node.value;
  }

  if (node.type === "image" && typeof node.alt === "string") {
    return node.alt;
  }

  if (!Array.isArray(node.children)) {
    return "";
  }

  return node.children.map(extractText).join("");
}
