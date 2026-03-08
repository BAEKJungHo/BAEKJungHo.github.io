#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk').default;

const STOCKS_DIR = './_stocks';
const TICKERS = [
    { symbol: 'TSLA', nameKo: '테슬라', nameEn: 'Tesla' },
    { symbol: 'META', nameKo: '메타', nameEn: 'Meta Platforms' },
    { symbol: 'NVDA', nameKo: '엔비디아', nameEn: 'Nvidia' },
    { symbol: 'RBLX', nameKo: '로블록스', nameEn: 'Roblox' },
    { symbol: 'COIN', nameKo: '코인베이스', nameEn: 'Coinbase' }
];

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

async function main() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error('ANTHROPIC_API_KEY environment variable is not set');
        process.exit(1);
    }

    // Determine today's date in KST
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat

    if (dayOfWeek === 0 || dayOfWeek === 6) {
        console.log('Weekend - skipping stock newsletter generation');
        process.exit(0);
    }

    const dateFile = formatDateCompact(now);    // YYYYMMDD
    const dateDisplay = formatDateDisplay(now);  // YYYY-MM-DD

    console.log(`Generating stock newsletter for ${dateDisplay}`);

    // Ensure _stocks/ directory exists
    fs.mkdirSync(STOCKS_DIR, { recursive: true });

    // Check if today's file already exists
    const outputPath = path.join(STOCKS_DIR, `stocks_${dateFile}.md`);
    if (fs.existsSync(outputPath)) {
        console.log(`Today's newsletter already exists: ${outputPath}`);
        process.exit(0);
    }

    // Call Claude API with web_search tool
    const client = new Anthropic({ apiKey });

    const tickerList = TICKERS.map(t => `${t.nameKo}(${t.symbol})`).join(', ');

    const prompt = `오늘은 ${dateDisplay} 입니다. 다음 주식 종목들에 대해 최신 뉴스와 분석을 작성해주세요: ${tickerList}

각 종목별로 다음 내용을 포함해야 합니다:
1. 최근 주요 뉴스 요약 (최소 3개 이상의 뉴스)
2. 각 뉴스의 원본 기사 링크 (실제 URL)
3. 단기 전망 (1-4주)
4. 장기 전망 (3-12개월)
5. 매수/매도/관망 추천 의견과 그 근거

## 출력 형식 규칙 (매우 중요 - 반드시 준수)
- 모든 제목(#, ##, ###, ####)은 반드시 영어로 작성
- 모든 본문 내용은 반드시 한글로 작성
- 마크다운 형식으로 작성
- 절대 불필요한 빈 줄을 넣지 마세요
- 문장 중간에 줄바꿈을 넣지 마세요. 한 문장은 반드시 한 줄에 완성하세요
- 마침표 뒤에 줄바꿈 후 이어지는 문장은 같은 줄에 이어서 작성하세요
- Recent News 의 각 뉴스 항목은 "- " 로 시작하는 한 줄이어야 하며, 빈 "- " 를 사용하지 마세요
- 출처 링크는 뉴스 본문 바로 다음 줄에 "  - " (들여쓰기 서브 불릿) 으로 작성하세요
- Short-term Outlook, Long-term Outlook, Investment Recommendation 은 하나의 자연스러운 문단으로 작성하세요 (문단 내에서 불필요한 줄바꿈 금지)

## 출력 구조
아래 예시를 정확히 따라주세요:

# Daily Stock Newsletter - ${dateDisplay}

## TSLA (Tesla)

### Recent News

- 뉴스 요약 내용을 한 줄로 완성합니다.
  - ([출처이름](https://example.com/article-url))

- 두 번째 뉴스 요약 내용을 한 줄로 완성합니다.
  - ([출처이름](https://example.com/article-url))

- 세 번째 뉴스 요약 내용을 한 줄로 완성합니다.
  - ([출처이름](https://example.com/article-url))

### Short-term Outlook

단기 전망을 하나의 문단으로 작성합니다. 여러 문장이 자연스럽게 이어져야 합니다. 문장 중간에 줄바꿈을 넣지 않습니다.

### Long-term Outlook

장기 전망을 하나의 문단으로 작성합니다. 여러 문장이 자연스럽게 이어져야 합니다.

### Investment Recommendation

**매수/매도/관망 (Buy/Sell/Hold)**: 추천 근거를 하나의 문단으로 작성합니다.

---

(나머지 종목도 위와 동일한 구조로 작성)

---

## Disclaimer

본 뉴스레터는 AI가 자동으로 생성한 것으로, 투자 조언이 아닙니다. 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다. 모든 투자에는 원금 손실의 위험이 있으며, 투자 전 충분한 조사와 전문가 상담을 권장합니다.`;

    console.log('Calling Claude API with web_search...');

    const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 16000,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 20 }],
        messages: [{ role: 'user', content: prompt }]
    });

    const rawText = message.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n\n');

    const responseText = cleanupMarkdown(rawText);

    // Build output file with front matter
    const fileContent = `---
layout  : wiki
title   : "Daily Stock Newsletter - ${dateDisplay}"
summary : "AI가 생성한 일일 주식 뉴스레터"
date    : ${dateDisplay} 18:00:00 +0900
updated : ${dateDisplay} 18:00:00 +0900
tag     : stock newsletter
toc     : true
public  : true
parent  : [[/stock]]
latex   : false
---

${responseText}
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Saved: ${outputPath}`);
    console.log('Done!');
}

function cleanupMarkdown(text) {
    let result = text;

    // Remove AI preamble lines (e.g. "이제 각 종목별로..." or "알겠습니다...")
    result = result.replace(/^[^\n#]*(?:작성하겠습니다|분석하겠습니다|정리하겠습니다|시작하겠습니다|알겠습니다)[.\s]*\n+/gm, '');

    // Fix empty bullet points: "- \n\nActual content\n\n (source)" -> "- Actual content\n  - (source)"
    result = result.replace(/^- *\n+\n*([^\n-][^\n]*)\n+\n* \((\[.*?\])\)/gm, '- $1\n  - ($2)');

    // Fix inline source links that got separated: "content\n\n ([Source](url))" -> on next line as sub-bullet
    result = result.replace(/\n\n \((\[.*?\]\(.*?\))\)/g, '\n  - ($1)');

    // Fix sentences split across lines with orphaned periods: "text\n\n. " or "text\n\n. text"
    result = result.replace(/\n\n\. /g, '. ');

    // Fix sentences split across lines: "text\n\nContinuation" within paragraphs (not headers, not bullets, not ---)
    // Only merge lines that are clearly continuation of a paragraph (don't start with #, -, *, **, ---)
    const lines = result.split('\n');
    const merged = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = lines[i + 1] || '';
        const nextNextLine = lines[i + 2] || '';

        merged.push(line);

        // If current line is empty, next line is also empty, and the line after is plain text
        // that continues a paragraph, skip the extra blank line
        if (line === '' && nextLine === '' &&
            nextNextLine !== '' &&
            !nextNextLine.startsWith('#') &&
            !nextNextLine.startsWith('-') &&
            !nextNextLine.startsWith('*') &&
            !nextNextLine.startsWith('---') &&
            !nextNextLine.startsWith('|')) {
            i++; // skip one extra blank line
        }
    }
    result = merged.join('\n');

    // Remove 3+ consecutive blank lines, keep max 2
    result = result.replace(/\n{4,}/g, '\n\n');

    // Trim leading/trailing whitespace
    result = result.trim();

    return result;
}

function formatDateCompact(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
}

function formatDateDisplay(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
