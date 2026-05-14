````markdown
# VS Code Markdown Shorts Reader 구현계획서

## 1. 프로젝트 개요

### 1.1 프로젝트명

가칭: **MD Shorts**

### 1.2 목적

VS Code에서 긴 Markdown 문서를 읽을 때, 사용자가 문서 전체를 한 번에 스크롤하며 읽는 대신 짧은 카드 단위로 나누어 빠르게 소비할 수 있도록 돕는 확장 프로그램을 개발한다.

이 확장 프로그램은 README, 설계 문서, 회의록, 기술 문서, PR 설명서, 온보딩 문서처럼 긴 Markdown 파일을 대상으로 한다.

### 1.3 핵심 아이디어

Markdown 문서를 구조적으로 분석한 뒤, 제목, 문단, 리스트, 코드 블록, 인용문 등의 단위로 나누고 이를 짧은 카드 형태로 보여준다.

사용자는 YouTube Shorts나 Instagram Reels처럼 키보드 또는 버튼으로 카드를 넘기며 문서를 읽을 수 있다.

### 1.4 주요 사용자

- 긴 README를 읽어야 하는 개발자
- 오픈소스 문서를 빠르게 훑어보는 개발자
- 설계 문서나 ADR을 자주 읽는 개발팀
- 자동 생성된 긴 Markdown 결과물을 검토하는 사용자
- 문서를 작성하면서 독자의 읽기 흐름을 확인하고 싶은 작성자

---

## 2. 문제 정의

### 2.1 기존 Markdown 읽기의 문제점

VS Code에서 Markdown 파일을 읽을 때 사용자는 일반적으로 다음 방식으로 문서를 소비한다.

```text
긴 문서를 위에서 아래로 계속 스크롤하며 읽음
````

이 방식에는 다음 문제가 있다.

* 긴 문서를 읽기 시작하기 어렵다.
* 현재 어디까지 읽었는지 파악하기 어렵다.
* 코드 블록, 리스트, 표, 설명 문단이 섞여 있을 때 집중력이 떨어진다.
* 자동 생성되었거나 길게 누적된 Markdown 문서를 검토할 때 피로도가 높다.
* 문서 전체 구조를 파악하기 전까지 중요도를 판단하기 어렵다.
* 읽기보다 훑어보기 또는 검토가 필요한 상황에 적합하지 않다.

### 2.2 해결 방향

Markdown 문서를 작은 카드 단위로 분할하여 사용자가 한 번에 하나의 정보 단위에만 집중할 수 있도록 한다.

```text
긴 문서 읽기
→ 짧은 카드 넘기기
→ 섹션 단위 이해
→ 필요 시 원문 위치로 이동
```

---

## 3. 제품 목표

### 3.1 v0.1 목표

v0.1에서는 외부 서비스 없이도 충분히 유용한 Markdown 카드 리더를 구현한다.

핵심 목표는 다음과 같다.

* 현재 열려 있는 Markdown 파일을 읽는다.
* Markdown AST를 기반으로 문서를 카드 단위로 분할한다.
* VS Code Webview에서 카드 UI를 제공한다.
* 키보드와 버튼으로 카드를 넘길 수 있다.
* 현재 카드의 원문 위치로 이동할 수 있다.
* 문서 수정 시 카드 내용을 자동 갱신한다.
* 읽던 위치를 저장하고 다시 열었을 때 복원한다.

### 3.2 v0.2 목표

v0.2에서는 읽기 경험을 개선한다.

* 카드 검색
* 섹션 목록
* 카드 북마크
* 코드 블록 접기
* 긴 카드 자동 분할 고도화
* 표 처리 개선
* 읽기 모드 설정

### 3.3 v0.3 목표

v0.3에서는 문서 탐색과 검토 경험을 고도화한다.

* 카드 타입 필터
* 읽은 카드 표시
* 이미지 카드 지원
* Mermaid 블록 감지
* 문서 구조 점검
* 읽기 통계 표시

---

## 4. MVP 범위

### 4.1 포함 기능

v0.1 MVP에 포함할 기능은 다음과 같다.

| 구분    | 기능                          |
| ----- | --------------------------- |
| 문서 읽기 | 현재 활성화된 Markdown 파일 읽기      |
| 문서 파싱 | Markdown AST 파싱             |
| 카드 생성 | 제목, 문단, 코드, 리스트, 인용문 단위 카드화 |
| 카드 병합 | 너무 짧은 문단 자동 병합              |
| 카드 UI | Webview Panel 기반 카드 리더      |
| 이동    | 이전/다음 카드 이동                 |
| 키보드   | 방향키, Space 키 이동             |
| 진행률   | 현재 카드 번호와 진행률 표시            |
| 원문 이동 | 현재 카드의 원본 Markdown 위치로 이동   |
| 자동 갱신 | 문서 수정 시 카드 재생성              |
| 상태 저장 | 파일별 마지막 읽은 카드 저장            |

### 4.2 제외 기능

v0.1에서 제외할 기능은 다음과 같다.

| 기능         | 제외 이유                    |
| ---------- | ------------------------ |
| 로그인        | MVP에서 불필요                |
| 클라우드 동기화   | 로컬 VS Code 확장으로 충분       |
| 브라우저 지원    | 타겟을 VS Code로 한정          |
| PDF 지원     | Markdown 전용으로 집중         |
| WYSIWYG 편집 | 읽기 경험에 집중                |
| 협업 기능      | MVP 범위 초과                |

---

## 5. 기술 스택

### 5.1 기본 스택

| 영역                | 기술                    |
| ----------------- | --------------------- |
| Extension Runtime | VS Code Extension API |
| Language          | TypeScript            |
| UI                | VS Code Webview       |
| Markdown Parser   | unified, remark-parse |
| Bundler           | esbuild               |
| Package Manager   | npm 또는 pnpm           |
| Test              | vitest                |
| Lint              | eslint                |
| Formatter         | prettier              |

### 5.2 주요 라이브러리

```bash
npm install unified remark-parse mdast-util-to-markdown
npm install -D typescript @types/node eslint prettier vitest esbuild
```

선택적으로 다음 라이브러리를 사용할 수 있다.

```bash
npm install unist-util-visit
npm install github-slugger
```

---

## 6. 전체 아키텍처

### 6.1 구조 개요

```text
VS Code Extension
 ├─ Extension Host
 │   ├─ 현재 Markdown 문서 읽기
 │   ├─ Markdown 파싱
 │   ├─ 카드 데이터 생성
 │   ├─ Webview 생성
 │   ├─ Webview 메시지 처리
 │   └─ 상태 저장
 │
 └─ Webview
     ├─ 카드 렌더링
     ├─ 키보드 입력 처리
     ├─ 이전/다음 이동
     ├─ 진행률 표시
     └─ Extension Host로 메시지 전송
```

### 6.2 데이터 흐름

```text
사용자가 Markdown 파일을 연다
        ↓
Command Palette에서 "Markdown Shorts: Open Reader" 실행
        ↓
extension.ts가 현재 activeTextEditor 확인
        ↓
document.getText()로 Markdown 원문 획득
        ↓
chunkMarkdown()으로 카드 배열 생성
        ↓
Webview Panel 생성
        ↓
cards 데이터를 Webview HTML에 주입
        ↓
사용자가 카드 이동
        ↓
필요 시 Webview가 Extension Host로 메시지 전송
        ↓
원문 위치 이동 또는 상태 저장
```

---

## 7. 디렉터리 구조

권장 디렉터리 구조는 다음과 같다.

```text
md-shorts/
  package.json
  tsconfig.json
  esbuild.js
  README.md
  CHANGELOG.md

  src/
    extension.ts

    markdown/
      chunkMarkdown.ts
      extractText.ts
      splitLongCard.ts
      types.ts

    webview/
      getWebviewHtml.ts
      webviewScript.ts
      webviewStyle.ts

    state/
      readingState.ts

    commands/
      openReader.ts

    utils/
      path.ts
      nonce.ts

  test/
    markdown/
      chunkMarkdown.test.ts
      splitLongCard.test.ts
```

초기에는 파일을 많이 나누지 않고 시작해도 된다.

최소 구조는 다음과 같다.

```text
src/
  extension.ts
  markdown/chunkMarkdown.ts
  webview/getWebviewHtml.ts
```

---

## 8. 핵심 데이터 모델

### 8.1 ReadingCard

```ts
export type ReadingCardType =
  | "heading"
  | "paragraph"
  | "code"
  | "list"
  | "blockquote"
  | "table"
  | "thematicBreak"
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
    wordCount?: number;
    charCount?: number;
    isLong?: boolean;
  };
};
```

### 8.2 ReadingSession

```ts
export type ReadingSession = {
  documentUri: string;
  documentVersion: number;
  cards: ReadingCard[];
  currentIndex: number;
  createdAt: number;
  updatedAt: number;
};
```

### 8.3 StoredReadingState

```ts
export type StoredReadingState = {
  documentUri: string;
  currentCardId?: string;
  currentIndex: number;
  updatedAt: number;
};
```

---

## 9. Markdown 분할 전략

### 9.1 기본 원칙

카드는 “의미 단위”를 기준으로 나눈다.

나쁜 방식:

```text
500자마다 무조건 자르기
```

좋은 방식:

```text
제목, 문단, 리스트, 코드 블록, 인용문 등 Markdown 구조 단위로 자르기
```

### 9.2 카드 생성 기준

| Markdown 요소   | 카드 처리 방식              |
| ------------- | --------------------- |
| heading       | 독립 카드 생성              |
| paragraph     | 문단 카드 생성              |
| list          | 리스트 전체를 하나의 카드로 생성    |
| code          | 코드 블록 카드 생성           |
| blockquote    | 인용문 카드 생성             |
| table         | 표 카드 생성 또는 원문 유지      |
| thematicBreak | 구분선 카드 또는 무시          |
| html          | raw HTML 카드 또는 텍스트 추출 |
| image         | 이미지 alt 텍스트 카드        |

### 9.3 카드 병합 기준

너무 짧은 문단은 하나의 카드로 합친다.

예시 기준:

```text
최소 카드 길이: 120자
권장 카드 길이: 300~700자
최대 카드 길이: 1,000자
```

병합 규칙:

```text
heading은 병합하지 않는다.
code는 병합하지 않는다.
서로 다른 섹션의 문단은 병합하지 않는다.
blockquote는 일반 문단과 병합하지 않는다.
paragraph끼리는 병합 가능하다.
짧은 list는 이전 paragraph와 병합 가능하다.
```

### 9.4 긴 카드 분할 기준

긴 문단은 문장 단위로 재분할한다.

```text
1,000자를 초과하는 paragraph
→ 문장 단위로 분리
→ 500~700자 안팎으로 재조합
```

긴 코드 블록은 자동으로 쪼개기보다 다음과 같이 처리한다.

```text
긴 코드 블록
→ 하나의 카드로 유지
→ UI에서 내부 스크롤 제공
→ 추후 "코드 블록 접기" 기능 추가
```

---

## 10. VS Code 명령어 설계

### 10.1 명령어 목록

v0.1에서는 다음 명령어를 제공한다.

```json
{
  "contributes": {
    "commands": [
      {
        "command": "mdShorts.openReader",
        "title": "MD Shorts: Open Reader"
      }
    ]
  }
}
```

추후 확장 가능한 명령어:

```json
{
  "command": "mdShorts.openReaderToSide",
  "title": "MD Shorts: Open Reader Beside"
}
```

```json
{
  "command": "mdShorts.resumeReader",
  "title": "MD Shorts: Resume Last Reading"
}
```

```json
{
  "command": "mdShorts.openSettings",
  "title": "MD Shorts: Open Settings"
}
```

### 10.2 활성화 조건

```json
{
  "activationEvents": [
    "onCommand:mdShorts.openReader"
  ]
}
```

추후 Markdown 파일에서만 메뉴가 보이게 하려면 다음을 사용할 수 있다.

```json
{
  "menus": {
    "editor/title": [
      {
        "command": "mdShorts.openReader",
        "when": "resourceLangId == markdown",
        "group": "navigation"
      }
    ]
  }
}
```

---

## 11. package.json 설계

초기 `package.json` 예시는 다음과 같다.

```json
{
  "name": "md-shorts",
  "displayName": "MD Shorts",
  "description": "Read long Markdown files as short, focused cards in VS Code.",
  "version": "0.1.0",
  "publisher": "your-publisher-name",
  "engines": {
    "vscode": "^1.90.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
    "onCommand:mdShorts.openReader"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "mdShorts.openReader",
        "title": "MD Shorts: Open Reader"
      }
    ],
    "menus": {
      "editor/title": [
        {
          "command": "mdShorts.openReader",
          "when": "resourceLangId == markdown",
          "group": "navigation"
        }
      ]
    },
    "configuration": {
      "title": "MD Shorts",
      "properties": {
        "mdShorts.maxCardChars": {
          "type": "number",
          "default": 700,
          "description": "Maximum preferred character count for a reading card."
        },
        "mdShorts.minCardChars": {
          "type": "number",
          "default": 120,
          "description": "Minimum preferred character count before merging small cards."
        },
        "mdShorts.openBeside": {
          "type": "boolean",
          "default": true,
          "description": "Open the reader beside the current editor."
        },
        "mdShorts.rememberPosition": {
          "type": "boolean",
          "default": true,
          "description": "Remember the last read card for each Markdown document."
        }
      }
    }
  },
  "scripts": {
    "compile": "node esbuild.js",
    "watch": "node esbuild.js --watch",
    "test": "vitest",
    "lint": "eslint src --ext ts",
    "format": "prettier --write ."
  },
  "dependencies": {
    "mdast-util-to-markdown": "^2.1.0",
    "remark-parse": "^11.0.0",
    "unified": "^11.0.5"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/vscode": "^1.90.0",
    "esbuild": "^0.21.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 12. Extension Host 구현 계획

### 12.1 activate 함수

`src/extension.ts`

역할:

* 명령어 등록
* 명령어 실행 시 현재 에디터 확인
* Markdown 파일 여부 검증
* Reader Panel 생성

```ts
import * as vscode from "vscode";
import { openReader } from "./commands/openReader";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "mdShorts.openReader",
    () => openReader(context)
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
```

### 12.2 openReader 명령어

`src/commands/openReader.ts`

역할:

* activeTextEditor 가져오기
* Markdown 여부 확인
* document text 추출
* cards 생성
* webview panel 생성
* 메시지 핸들러 등록
* 문서 변경 이벤트 등록

```ts
import * as vscode from "vscode";
import { chunkMarkdown } from "../markdown/chunkMarkdown";
import { getWebviewHtml } from "../webview/getWebviewHtml";
import { getReadingState, saveReadingState } from "../state/readingState";

export function openReader(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showInformationMessage("열려 있는 파일이 없습니다.");
    return;
  }

  const document = editor.document;

  if (document.languageId !== "markdown") {
    vscode.window.showInformationMessage("Markdown 파일에서만 사용할 수 있습니다.");
    return;
  }

  const markdown = document.getText();
  const cards = chunkMarkdown(markdown);

  if (cards.length === 0) {
    vscode.window.showInformationMessage("읽을 수 있는 Markdown 콘텐츠가 없습니다.");
    return;
  }

  const previousState = getReadingState(context, document.uri.toString());
  const initialIndex = previousState?.currentIndex ?? 0;

  const panel = vscode.window.createWebviewPanel(
    "mdShorts.reader",
    `MD Shorts: ${getFileName(document.uri)}`,
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  panel.webview.html = getWebviewHtml({
    webview: panel.webview,
    cards,
    initialIndex
  });

  panel.webview.onDidReceiveMessage((message) => {
    if (message.type === "revealSource") {
      const card = cards[message.index];
      if (!card) return;

      const position = new vscode.Position(card.startLine, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenter
      );
    }

    if (message.type === "savePosition") {
      saveReadingState(context, {
        documentUri: document.uri.toString(),
        currentIndex: message.index,
        updatedAt: Date.now()
      });
    }
  });

  const changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document.uri.toString() !== document.uri.toString()) {
      return;
    }

    const updatedCards = chunkMarkdown(event.document.getText());

    panel.webview.postMessage({
      type: "updateCards",
      cards: updatedCards
    });
  });

  panel.onDidDispose(() => {
    changeDisposable.dispose();
  });
}

function getFileName(uri: vscode.Uri): string {
  return uri.path.split("/").pop() ?? "Markdown";
}
```

---

## 13. Markdown Parser 구현 계획

### 13.1 chunkMarkdown 함수

`src/markdown/chunkMarkdown.ts`

역할:

* Markdown 문자열을 AST로 변환
* AST 노드를 순회
* ReadingCard 배열 생성
* 작은 카드 병합
* 긴 카드 분할
* 라인 번호 포함

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import { toMarkdown } from "mdast-util-to-markdown";
import type { ReadingCard } from "./types";

export function chunkMarkdown(markdown: string): ReadingCard[] {
  const tree = unified().use(remarkParse).parse(markdown);
  const rawCards: ReadingCard[] = [];

  const sectionPath: string[] = [];

  for (const node of tree.children as any[]) {
    if (node.type === "heading") {
      const title = extractText(node);
      const level = node.depth;

      sectionPath.length = level - 1;
      sectionPath[level - 1] = title;

      rawCards.push({
        id: createId(),
        type: "heading",
        title,
        content: title,
        level,
        startLine: getStartLine(node),
        endLine: getEndLine(node),
        sectionPath: [...sectionPath],
        meta: {
          charCount: title.length
        }
      });

      continue;
    }

    if (node.type === "paragraph") {
      const content = extractText(node);

      rawCards.push({
        id: createId(),
        type: "paragraph",
        title: getCurrentSectionTitle(sectionPath),
        content,
        startLine: getStartLine(node),
        endLine: getEndLine(node),
        sectionPath: [...sectionPath],
        meta: {
          charCount: content.length,
          wordCount: countWords(content)
        }
      });

      continue;
    }

    if (node.type === "code") {
      rawCards.push({
        id: createId(),
        type: "code",
        title: getCurrentSectionTitle(sectionPath),
        content: node.value,
        startLine: getStartLine(node),
        endLine: getEndLine(node),
        sectionPath: [...sectionPath],
        meta: {
          language: node.lang,
          charCount: node.value.length,
          isLong: node.value.length > 1200
        }
      });

      continue;
    }

    if (node.type === "list") {
      const content = toMarkdown(node);

      rawCards.push({
        id: createId(),
        type: "list",
        title: getCurrentSectionTitle(sectionPath),
        content,
        startLine: getStartLine(node),
        endLine: getEndLine(node),
        sectionPath: [...sectionPath],
        meta: {
          charCount: content.length
        }
      });

      continue;
    }

    if (node.type === "blockquote") {
      const content = toMarkdown(node);

      rawCards.push({
        id: createId(),
        type: "blockquote",
        title: getCurrentSectionTitle(sectionPath),
        content,
        startLine: getStartLine(node),
        endLine: getEndLine(node),
        sectionPath: [...sectionPath],
        meta: {
          charCount: content.length
        }
      });

      continue;
    }
  }

  const splitCards = splitLongCards(rawCards);
  const mergedCards = mergeSmallCards(splitCards);

  return mergedCards;
}
```

### 13.2 라인 번호 계산

remark AST의 position 정보를 사용한다.

```ts
function getStartLine(node: any): number {
  return Math.max((node.position?.start?.line ?? 1) - 1, 0);
}

function getEndLine(node: any): number {
  return Math.max((node.position?.end?.line ?? 1) - 1, 0);
}
```

VS Code의 `Position`은 0-based line index를 사용하므로 `-1` 처리가 필요하다.

### 13.3 텍스트 추출

```ts
function extractText(node: any): string {
  if (!node) return "";

  if (typeof node.value === "string") {
    return node.value;
  }

  if (!Array.isArray(node.children)) {
    return "";
  }

  return node.children.map(extractText).join("");
}
```

### 13.4 섹션 제목 추출

```ts
function getCurrentSectionTitle(sectionPath: string[]): string | undefined {
  if (sectionPath.length === 0) return undefined;
  return sectionPath[sectionPath.length - 1];
}
```

### 13.5 ID 생성

```ts
function createId(): string {
  return Math.random().toString(36).slice(2);
}
```

추후에는 안정적인 ID를 위해 `documentUri + startLine + endLine + content hash`를 사용할 수 있다.

---

## 14. 카드 병합 구현 계획

### 14.1 mergeSmallCards 함수

```ts
function mergeSmallCards(cards: ReadingCard[]): ReadingCard[] {
  const minChars = 120;
  const maxChars = 700;

  const result: ReadingCard[] = [];
  let buffer: ReadingCard | null = null;

  for (const card of cards) {
    if (shouldNeverMerge(card)) {
      if (buffer) {
        result.push(buffer);
        buffer = null;
      }

      result.push(card);
      continue;
    }

    if (!buffer) {
      buffer = card;
      continue;
    }

    if (canMerge(buffer, card, maxChars)) {
      buffer = mergeCards(buffer, card);
    } else {
      result.push(buffer);
      buffer = card;
    }
  }

  if (buffer) {
    result.push(buffer);
  }

  return result.filter((card) => card.content.trim().length > 0);
}
```

### 14.2 병합 제한 규칙

```ts
function shouldNeverMerge(card: ReadingCard): boolean {
  return card.type === "heading" || card.type === "code";
}
```

```ts
function canMerge(
  previous: ReadingCard,
  next: ReadingCard,
  maxChars: number
): boolean {
  if (previous.type === "code" || next.type === "code") {
    return false;
  }

  if (previous.type === "heading" || next.type === "heading") {
    return false;
  }

  if (previous.sectionPath.join("/") !== next.sectionPath.join("/")) {
    return false;
  }

  const combinedLength = previous.content.length + next.content.length;

  return combinedLength <= maxChars;
}
```

### 14.3 카드 병합

```ts
function mergeCards(previous: ReadingCard, next: ReadingCard): ReadingCard {
  return {
    ...previous,
    id: `${previous.id}_${next.id}`,
    type: "mixed",
    content: `${previous.content}\n\n${next.content}`,
    endLine: next.endLine,
    meta: {
      ...previous.meta,
      charCount: previous.content.length + next.content.length
    }
  };
}
```

---

## 15. 긴 카드 분할 구현 계획

### 15.1 splitLongCards 함수

```ts
function splitLongCards(cards: ReadingCard[]): ReadingCard[] {
  const maxChars = 1000;

  return cards.flatMap((card) => {
    if (card.type === "code") {
      return [card];
    }

    if (card.content.length <= maxChars) {
      return [card];
    }

    return splitTextCard(card, 700);
  });
}
```

### 15.2 문장 단위 분할

```ts
function splitTextCard(card: ReadingCard, targetChars: number): ReadingCard[] {
  const sentences = card.content.split(/(?<=[.!?。！？다요음])\s+/);
  const result: ReadingCard[] = [];

  let buffer = "";

  for (const sentence of sentences) {
    if ((buffer + sentence).length > targetChars && buffer.length > 0) {
      result.push(createDerivedCard(card, buffer, result.length));
      buffer = sentence;
    } else {
      buffer += buffer ? ` ${sentence}` : sentence;
    }
  }

  if (buffer.trim()) {
    result.push(createDerivedCard(card, buffer, result.length));
  }

  return result;
}
```

### 15.3 파생 카드 생성

```ts
function createDerivedCard(
  original: ReadingCard,
  content: string,
  index: number
): ReadingCard {
  return {
    ...original,
    id: `${original.id}_${index}`,
    content,
    type: original.type === "paragraph" ? "paragraph" : "mixed",
    meta: {
      ...original.meta,
      charCount: content.length,
      isLong: false
    }
  };
}
```

---

## 16. Webview 구현 계획

### 16.1 Webview 역할

Webview는 다음 역할만 담당한다.

* 카드 표시
* 현재 index 관리
* 키보드 입력 처리
* 진행률 렌더링
* 버튼 클릭 처리
* Extension Host에 메시지 전송

Markdown 파싱이나 파일 접근은 Webview에서 하지 않는다.

### 16.2 getWebviewHtml 인터페이스

```ts
type GetWebviewHtmlOptions = {
  webview: vscode.Webview;
  cards: ReadingCard[];
  initialIndex: number;
};

export function getWebviewHtml(options: GetWebviewHtmlOptions): string {
  const { cards, initialIndex } = options;

  const safeCardsJson = JSON.stringify(cards).replace(/</g, "\\u003c");

  return `...`;
}
```

### 16.3 Webview HTML 구조

```html
<div class="app">
  <header class="topbar">
    <div class="brand">MD Shorts</div>
    <div id="counter"></div>
  </header>

  <div class="progress">
    <div id="progressInner"></div>
  </div>

  <main class="viewer">
    <article class="card">
      <div id="sectionPath"></div>
      <div id="type"></div>
      <div id="title"></div>
      <pre id="content"></pre>
    </article>
  </main>

  <footer class="footer">
    <button id="prevButton">이전</button>
    <button id="revealButton">원문으로 이동</button>
    <button id="nextButton">다음</button>
  </footer>
</div>
```

### 16.4 Webview 스타일 기준

VS Code 테마 변수를 사용한다.

```css
body {
  background: var(--vscode-editor-background);
  color: var(--vscode-editor-foreground);
  font-family: var(--vscode-font-family);
}
```

버튼:

```css
button {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
}
```

코드 블록:

```css
.content.code {
  font-family: var(--vscode-editor-font-family);
  background: var(--vscode-textCodeBlock-background);
}
```

### 16.5 Webview Script

```js
const vscode = acquireVsCodeApi();

let cards = INITIAL_CARDS;
let index = INITIAL_INDEX;

function render() {
  const card = cards[index];

  counterEl.textContent = `${index + 1} / ${cards.length}`;
  progressInnerEl.style.width = `${((index + 1) / cards.length) * 100}%`;

  sectionPathEl.textContent = card.sectionPath?.join(" > ") ?? "";
  typeEl.textContent = card.type;
  titleEl.textContent = card.title ?? "";
  contentEl.textContent = card.content;

  contentEl.className = card.type === "code" ? "content code" : "content";

  vscode.postMessage({
    type: "savePosition",
    index
  });
}

function next() {
  index = Math.min(index + 1, cards.length - 1);
  render();
}

function prev() {
  index = Math.max(index - 1, 0);
  render();
}

function revealSource() {
  vscode.postMessage({
    type: "revealSource",
    index
  });
}
```

---

## 17. 키보드 UX

### 17.1 기본 키 매핑

| 키          | 동작        |
| ---------- | --------- |
| ArrowRight | 다음 카드     |
| ArrowDown  | 다음 카드     |
| Space      | 다음 카드     |
| ArrowLeft  | 이전 카드     |
| ArrowUp    | 이전 카드     |
| Home       | 첫 카드      |
| End        | 마지막 카드    |
| Enter      | 원문 위치로 이동 |

### 17.2 구현 예시

```js
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " ") {
    event.preventDefault();
    next();
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    prev();
  }

  if (event.key === "Home") {
    event.preventDefault();
    index = 0;
    render();
  }

  if (event.key === "End") {
    event.preventDefault();
    index = cards.length - 1;
    render();
  }

  if (event.key === "Enter") {
    event.preventDefault();
    revealSource();
  }
});
```

---

## 18. 원문 위치 이동 기능

### 18.1 기능 설명

사용자가 현재 카드를 읽다가 원문에서 해당 위치를 확인하고 싶을 수 있다.

이를 위해 각 카드에 `startLine`, `endLine`을 저장한다.

Webview에서 `revealSource` 메시지를 보내면 Extension Host가 원본 Markdown 에디터에서 해당 줄로 이동한다.

### 18.2 Webview 메시지

```js
vscode.postMessage({
  type: "revealSource",
  index
});
```

### 18.3 Extension Host 처리

```ts
panel.webview.onDidReceiveMessage((message) => {
  if (message.type !== "revealSource") return;

  const card = cards[message.index];
  if (!card) return;

  const start = new vscode.Position(card.startLine, 0);
  const end = new vscode.Position(card.endLine, 0);

  editor.selection = new vscode.Selection(start, end);

  editor.revealRange(
    new vscode.Range(start, end),
    vscode.TextEditorRevealType.InCenter
  );
});
```

---

## 19. 문서 변경 자동 갱신

### 19.1 기능 설명

Markdown 파일이 수정되면 카드도 갱신되어야 한다.

다만 사용자가 타이핑할 때마다 즉시 재파싱하면 성능 문제가 생길 수 있으므로 debounce를 적용한다.

### 19.2 Debounce 구현

```ts
let updateTimer: NodeJS.Timeout | undefined;

const changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
  if (event.document.uri.toString() !== document.uri.toString()) {
    return;
  }

  if (updateTimer) {
    clearTimeout(updateTimer);
  }

  updateTimer = setTimeout(() => {
    const updatedCards = chunkMarkdown(event.document.getText());

    panel.webview.postMessage({
      type: "updateCards",
      cards: updatedCards
    });
  }, 300);
});
```

### 19.3 Webview 처리

```js
window.addEventListener("message", (event) => {
  const message = event.data;

  if (message.type === "updateCards") {
    cards = message.cards;
    index = Math.min(index, cards.length - 1);
    render();
  }
});
```

---

## 20. 읽기 위치 저장

### 20.1 저장 방식

VS Code Extension의 `workspaceState`를 사용한다.

파일별로 마지막 카드 index를 저장한다.

```ts
type StoredReadingState = {
  documentUri: string;
  currentIndex: number;
  updatedAt: number;
};
```

### 20.2 저장 함수

`src/state/readingState.ts`

```ts
import * as vscode from "vscode";

const STORAGE_KEY = "mdShorts.readingState";

export type StoredReadingState = {
  documentUri: string;
  currentIndex: number;
  updatedAt: number;
};

export function getReadingState(
  context: vscode.ExtensionContext,
  documentUri: string
): StoredReadingState | undefined {
  const states =
    context.workspaceState.get<Record<string, StoredReadingState>>(STORAGE_KEY) ?? {};

  return states[documentUri];
}

export function saveReadingState(
  context: vscode.ExtensionContext,
  state: StoredReadingState
) {
  const states =
    context.workspaceState.get<Record<string, StoredReadingState>>(STORAGE_KEY) ?? {};

  states[state.documentUri] = state;

  return context.workspaceState.update(STORAGE_KEY, states);
}
```

### 20.3 저장 타이밍

다음 상황에서 저장한다.

```text
카드 이동 시
Webview dispose 시
VS Code 종료 전
```

v0.1에서는 카드 이동 시 저장만으로 충분하다.

---

## 21. 설정 옵션

### 21.1 v0.1 설정

| 설정명                       | 타입      | 기본값  | 설명                  |
| ------------------------- | ------- | ---- | ------------------- |
| mdShorts.maxCardChars     | number  | 700  | 권장 최대 카드 길이         |
| mdShorts.minCardChars     | number  | 120  | 병합 전 최소 카드 길이       |
| mdShorts.rememberPosition | boolean | true | 파일별 읽기 위치 저장        |
| mdShorts.openBeside       | boolean | true | 현재 편집기 옆에 Reader 열기 |
| mdShorts.autoRefresh      | boolean | true | 문서 변경 시 자동 갱신       |

### 21.2 설정 읽기

```ts
const config = vscode.workspace.getConfiguration("mdShorts");

const maxCardChars = config.get<number>("maxCardChars", 700);
const minCardChars = config.get<number>("minCardChars", 120);
const rememberPosition = config.get<boolean>("rememberPosition", true);
```

---

## 22. UI 상세 설계

### 22.1 화면 구성

```text
┌───────────────────────────────────────────────┐
│ MD Shorts                         12 / 48     │
├───────────────────────────────────────────────┤
│ ████████████░░░░░░░░░░░░░░░░░░░░              │
├───────────────────────────────────────────────┤
│                                               │
│              ┌─────────────────┐              │
│              │ section path    │              │
│              │ type            │              │
│              │                 │              │
│              │ card content    │              │
│              │                 │              │
│              └─────────────────┘              │
│                                               │
├───────────────────────────────────────────────┤
│ 이전       원문으로 이동             다음     │
└───────────────────────────────────────────────┘
```

### 22.2 카드 내부 정보

각 카드에는 다음 정보를 표시한다.

```text
섹션 경로
카드 타입
섹션 제목
본문
코드 언어
현재 위치
```

예시:

```text
Architecture > Plugin System

CODE · TypeScript

export interface Plugin {
  name: string;
  setup(): void;
}
```

### 22.3 카드 타입별 UI

| 타입         | UI                      |
| ---------- | ----------------------- |
| heading    | 큰 제목 카드                 |
| paragraph  | 일반 텍스트 카드               |
| code       | monospace, 코드 배경        |
| list       | 줄 간격 넓은 리스트             |
| blockquote | 왼쪽 border 강조            |
| table      | monospace 또는 HTML table |
| mixed      | 일반 텍스트                  |

---

## 23. 성능 고려사항

### 23.1 예상 입력 크기

일반 Markdown 파일:

```text
1KB ~ 100KB
```

큰 문서:

```text
100KB ~ 1MB
```

v0.1에서는 1MB 이하 문서를 안정적으로 처리하는 것을 목표로 한다.

### 23.2 성능 전략

* 문서 파싱은 Extension Host에서 수행한다.
* Webview에는 카드 데이터만 전달한다.
* 문서 변경 시 debounce를 적용한다.
* 너무 큰 코드 블록은 자르지 않고 내부 스크롤 처리한다.
* Webview에서 전체 DOM을 많이 만들지 않고 현재 카드만 렌더링한다.

### 23.3 대용량 문서 처리

문서가 너무 클 경우 경고를 표시한다.

```ts
if (markdown.length > 1_000_000) {
  const answer = await vscode.window.showWarningMessage(
    "문서가 매우 큽니다. 카드 생성에 시간이 걸릴 수 있습니다.",
    "계속",
    "취소"
  );

  if (answer !== "계속") {
    return;
  }
}
```

---

## 24. 보안 고려사항

### 24.1 Webview 보안

Webview는 기본적으로 신뢰할 수 없는 HTML 실행 환경이므로 다음을 지킨다.

* Markdown 원문을 HTML로 직접 삽입하지 않는다.
* 카드 본문은 `textContent`로 렌더링한다.
* `innerHTML` 사용을 피한다.
* CSP를 설정한다.
* 외부 스크립트를 로드하지 않는다.

### 24.2 데이터 주입 방지

카드 JSON을 HTML에 삽입할 때 `<` 문자를 escape한다.

```ts
const safeCardsJson = JSON.stringify(cards).replace(/</g, "\\u003c");
```

### 24.3 CSP 설정

초기 MVP에서는 inline script를 사용할 수 있지만, 배포 버전에서는 nonce 기반으로 분리하는 것이 좋다.

MVP:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';"
/>
```

권장:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';"
/>
```

---

## 25. 테스트 계획

### 25.1 단위 테스트 대상

Markdown 파서와 카드 분할 로직은 반드시 테스트한다.

| 테스트 대상            | 내용                    |
| ----------------- | --------------------- |
| heading parsing   | 제목 카드 생성 확인           |
| paragraph parsing | 문단 카드 생성 확인           |
| code parsing      | 코드 블록 카드 생성 확인        |
| list parsing      | 리스트 카드 생성 확인          |
| mergeSmallCards   | 짧은 카드 병합 확인           |
| splitLongCards    | 긴 문단 분할 확인            |
| line numbers      | startLine, endLine 확인 |
| empty document    | 빈 문서 처리 확인            |

### 25.2 테스트 예시

```ts
import { describe, expect, it } from "vitest";
import { chunkMarkdown } from "../../src/markdown/chunkMarkdown";

describe("chunkMarkdown", () => {
  it("creates heading and paragraph cards", () => {
    const markdown = `
# Hello

This is a paragraph.
`;

    const cards = chunkMarkdown(markdown);

    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].type).toBe("heading");
    expect(cards[0].content).toBe("Hello");
  });

  it("keeps code blocks as separate cards", () => {
    const markdown = `
# Example

\`\`\`ts
const value = 1;
\`\`\`
`;

    const cards = chunkMarkdown(markdown);
    const codeCard = cards.find((card) => card.type === "code");

    expect(codeCard).toBeDefined();
    expect(codeCard?.content).toContain("const value = 1");
  });
});
```

### 25.3 수동 테스트 시나리오

| 시나리오                | 기대 결과           |
| ------------------- | --------------- |
| Markdown 파일에서 명령 실행 | Reader가 열린다     |
| 일반 txt 파일에서 명령 실행   | 경고 메시지가 뜬다      |
| 방향키 입력              | 카드가 이동한다        |
| Space 입력            | 다음 카드로 이동한다     |
| 원문 이동 클릭            | 원본 위치로 커서가 이동한다 |
| 문서 수정               | 카드가 자동 갱신된다     |
| Reader 닫고 다시 열기     | 마지막 위치가 복원된다    |

---

## 26. 개발 단계별 일정

### 26.1 Phase 1: 프로젝트 초기화

목표:

* VS Code Extension 프로젝트 생성
* TypeScript 빌드 환경 구성
* 명령어 등록
* Markdown 파일 검증

작업 목록:

```text
[ ] yo code로 프로젝트 생성
[ ] package.json 정리
[ ] esbuild 설정
[ ] mdShorts.openReader 명령어 등록
[ ] activeTextEditor 확인
[ ] Markdown 파일 여부 확인
```

완료 기준:

```text
Command Palette에서 "MD Shorts: Open Reader" 실행 가능
Markdown이 아닌 파일에서는 안내 메시지 표시
```

---

### 26.2 Phase 2: Markdown 카드 분할

목표:

* Markdown AST 파싱
* 카드 데이터 모델 생성
* 기본 카드 생성

작업 목록:

```text
[ ] unified, remark-parse 설치
[ ] ReadingCard 타입 정의
[ ] heading 카드 생성
[ ] paragraph 카드 생성
[ ] code 카드 생성
[ ] list 카드 생성
[ ] blockquote 카드 생성
[ ] line number 추출
```

완료 기준:

```text
Markdown 입력 → ReadingCard[] 출력 가능
각 카드에 type, content, startLine, endLine 포함
```

---

### 26.3 Phase 3: 카드 품질 개선

목표:

* 너무 짧은 카드 병합
* 너무 긴 카드 분할
* 섹션 경로 관리

작업 목록:

```text
[ ] sectionPath 구현
[ ] mergeSmallCards 구현
[ ] splitLongCards 구현
[ ] code 카드 병합 제외
[ ] heading 카드 병합 제외
[ ] 테스트 추가
```

완료 기준:

```text
긴 README를 넣었을 때 카드 단위가 자연스럽게 생성됨
```

---

### 26.4 Phase 4: Webview UI

목표:

* 카드 리더 UI 구현
* 진행률 표시
* 버튼 이동
* 키보드 이동

작업 목록:

```text
[ ] Webview Panel 생성
[ ] getWebviewHtml 구현
[ ] 카드 데이터 주입
[ ] 카드 렌더링
[ ] 이전/다음 버튼 구현
[ ] 키보드 이벤트 구현
[ ] 진행률 표시
[ ] VS Code 테마 변수 적용
```

완료 기준:

```text
Webview에서 카드가 표시되고 키보드로 넘길 수 있음
```

---

### 26.5 Phase 5: VS Code 연동

목표:

* 원문 위치 이동
* 문서 변경 자동 갱신
* 읽기 위치 저장

작업 목록:

```text
[ ] revealSource 메시지 구현
[ ] 원본 에디터 라인 이동 구현
[ ] onDidChangeTextDocument 구독
[ ] debounce 적용
[ ] updateCards 메시지 구현
[ ] workspaceState 저장
[ ] 마지막 읽기 위치 복원
```

완료 기준:

```text
현재 카드의 원문 위치로 이동 가능
문서 수정 시 카드 갱신
Reader를 다시 열면 마지막 위치 복원
```

---

### 26.6 Phase 6: 안정화 및 배포 준비

목표:

* 테스트 보강
* README 작성
* Marketplace 배포 준비

작업 목록:

```text
[ ] 단위 테스트 추가
[ ] 수동 테스트
[ ] README 작성
[ ] 기능 GIF 또는 스크린샷 준비
[ ] CHANGELOG 작성
[ ] LICENSE 추가
[ ] vsce 패키징 테스트
```

완료 기준:

```text
.vsix 파일 생성 가능
로컬 설치 후 정상 동작
```

---

## 27. 배포 계획

### 27.1 로컬 패키징

```bash
npm install -g @vscode/vsce
vsce package
```

결과:

```text
md-shorts-0.1.0.vsix
```

### 27.2 로컬 설치 테스트

```bash
code --install-extension md-shorts-0.1.0.vsix
```

### 27.3 Marketplace 배포 전 체크리스트

```text
[ ] extension name 확정
[ ] publisher 계정 생성
[ ] icon 준비
[ ] README 작성
[ ] CHANGELOG 작성
[ ] LICENSE 작성
[ ] repository URL 추가
[ ] preview 이미지 추가
[ ] 최소 VS Code 버전 확인
```

---

## 28. README 구성안

README는 다음 구조로 작성한다.

```markdown
# MD Shorts

Read long Markdown files as short, focused cards in VS Code.

## Features

- Convert Markdown files into reading cards
- Navigate with keyboard
- Jump back to source line
- Remember reading position
- Auto-refresh on document changes

## Usage

1. Open a Markdown file
2. Run `MD Shorts: Open Reader`
3. Use arrow keys or space to move between cards

## Keyboard Shortcuts

| Key | Action |
|---|---|
| Space | Next card |
| ArrowRight | Next card |
| ArrowLeft | Previous card |
| Enter | Reveal source |

## Settings

...
```

---

## 29. 향후 기능 로드맵

### 29.1 v0.2 읽기 경험 개선

```text
[ ] 섹션 목록 사이드바
[ ] 카드 검색
[ ] 북마크
[ ] 읽은 카드 표시
[ ] 카드 타입 필터
[ ] 코드 블록 접기
[ ] 표 렌더링 개선
[ ] 이미지 카드 지원
[ ] Mermaid 블록 감지
```

### 29.2 v0.3 문서 탐색 및 검토 고도화

```text
[ ] 문서가 너무 긴 섹션 감지
[ ] 읽기 어려운 문단 감지
[ ] 제목 계층 구조 점검
[ ] 빈 섹션 또는 지나치게 짧은 섹션 감지
[ ] 링크와 이미지 참조 점검
[ ] 문서 읽기 통계 표시
[ ] 독자 관점 카드 미리보기 개선
```

### 29.3 v1.0 제품화

```text
[ ] Marketplace 정식 배포
[ ] 사용자 설정 고도화
[ ] Telemetry 선택적 지원
[ ] 팀 문서 템플릿 지원
[ ] GitHub README 특화 기능
```

---

## 30. 주요 리스크와 대응 방안

### 30.1 카드 분할 품질이 낮을 수 있음

문제:

```text
카드가 너무 잘게 쪼개지거나 너무 길어질 수 있다.
```

대응:

```text
AST 기반 분할을 기본으로 한다.
짧은 카드는 병합한다.
긴 문단은 문장 단위로 분할한다.
설정으로 min/max 카드 길이를 조정 가능하게 한다.
```

### 30.2 코드 블록 가독성 문제

문제:

```text
긴 코드 블록은 카드 UI에서 읽기 어렵다.
```

대응:

```text
코드 블록은 병합하지 않는다.
코드 카드 내부에 스크롤을 제공한다.
추후 코드 접기 기능을 추가한다.
```

### 30.3 문서 수정 시 현재 위치가 어긋날 수 있음

문제:

```text
문서가 수정되면 카드 index가 달라질 수 있다.
```

대응:

```text
v0.1에서는 index 기준으로 복원한다.
추후 startLine 또는 content hash 기반 복원을 추가한다.
```

### 30.4 Webview 보안 문제

문제:

```text
Markdown 내용이 HTML로 삽입되면 XSS 위험이 있다.
```

대응:

```text
innerHTML을 사용하지 않는다.
textContent로 렌더링한다.
CSP를 설정한다.
JSON 주입 시 escape 처리한다.
```

---

## 31. v0.1 완료 기준

v0.1은 다음 조건을 만족하면 완료로 본다.

```text
[ ] VS Code에서 Markdown 파일을 열고 명령어 실행 가능
[ ] Webview Reader가 열린다
[ ] Markdown이 카드로 분할된다
[ ] 카드가 하나씩 표시된다
[ ] 이전/다음 이동 가능
[ ] 키보드 이동 가능
[ ] 진행률 표시 가능
[ ] 현재 카드의 원문 위치로 이동 가능
[ ] 문서 수정 시 카드가 갱신된다
[ ] 마지막 읽기 위치가 저장된다
[ ] 기본 README와 긴 Markdown 문서에서 정상 동작한다
```

---

## 32. 최종 구현 순서 요약

가장 효율적인 구현 순서는 다음과 같다.

```text
1. VS Code Extension 프로젝트 생성
2. 명령어 등록
3. 현재 Markdown 문서 읽기
4. remark-parse로 Markdown AST 파싱
5. ReadingCard 배열 생성
6. Webview Panel 생성
7. 카드 UI 렌더링
8. 이전/다음 이동 구현
9. 키보드 이동 구현
10. 원문 위치 이동 구현
11. 문서 변경 자동 갱신
12. 읽기 위치 저장
13. 테스트 작성
14. README 및 배포 준비
```

---

## 33. 핵심 판단

이 프로젝트는 외부 서비스에 의존하지 않는 로컬 Markdown 읽기 도구다.

가장 중요한 것은 다음 세 가지다.

```text
1. Markdown을 자연스럽게 카드로 쪼개는 품질
2. VS Code 안에서 빠르게 읽을 수 있는 UX
3. 원문과 카드 사이를 쉽게 오갈 수 있는 개발자 친화성
```

따라서 제품의 방향은 Markdown 카드화 품질, 빠른 탐색, 원문 이동, 읽기 상태 관리에 집중한다.

향후 기능도 검색, 섹션 탐색, 북마크, 카드 필터, 문서 구조 점검처럼 로컬에서 처리 가능한 읽기 경험 개선에 한정한다.

```
```
