#!/usr/bin/env node

const YAML = require('yamljs');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk').default;

const WIKI_DIR = './_wiki';
const QNA_DIR = './data/qna';
const SCHEDULE_PATH = './tool/qna-schedule.yml';
const HISTORY_PATH = path.join(QNA_DIR, 'history.json');
const INDEX_PATH = path.join(QNA_DIR, 'index.json');
const MAX_CONTENT_LENGTH = 1500;
const KOREAN_DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

async function main() {
    // 1. Load schedule
    const schedule = YAML.load(SCHEDULE_PATH);

    // 2. Determine today's day (KST)
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const dayIndex = now.getDay();
    const dayKey = DAY_KEYS[dayIndex];
    const koreanDay = KOREAN_DAYS[dayIndex];
    const dateStr = formatDate(now);

    console.log(`Today: ${dateStr} (${koreanDay})`);

    // 3. Find schedule entry
    const todaySchedule = schedule.schedule[dayKey];
    if (!todaySchedule) {
        console.error(`No schedule found for ${dayKey}`);
        process.exit(1);
    }

    console.log(`Topic: ${todaySchedule.topic}`);
    console.log(`Wiki dirs: ${todaySchedule.wiki_dirs.join(', ')}`);

    // 4. Scan wiki files
    const wikiFiles = scanWikiFiles(todaySchedule.wiki_dirs);
    console.log(`Found ${wikiFiles.length} wiki files`);

    if (wikiFiles.length === 0) {
        console.error('No wiki files found for today\'s topic');
        process.exit(1);
    }

    // 5. Load history
    const history = loadHistory();

    // 6. Select context files (prefer unused ones)
    const selectedFiles = selectFiles(wikiFiles, history, 5, 8);
    console.log(`Selected ${selectedFiles.length} files as context`);

    // 7. Parse file contents
    const parsedFiles = selectedFiles.map(f => parseWikiFile(f));

    // 8. Call Claude API
    const questionsPerDay = schedule.questions_per_day || 3;
    const questions = await generateQuestions(parsedFiles, todaySchedule.topic, questionsPerDay);

    // 9. Create output
    const output = {
        date: dateStr,
        dayOfWeek: koreanDay,
        topic: todaySchedule.topic,
        questions: questions.map((q, i) => ({
            id: i + 1,
            question: q.question,
            tags: q.tags,
            references: q.references
        }))
    };

    // 10. Ensure data/qna/ directory exists
    fs.mkdirSync(QNA_DIR, { recursive: true });

    // 11. Save daily file
    const outputPath = path.join(QNA_DIR, `${dateStr}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`Saved: ${outputPath}`);

    // 12. Update index.json
    updateIndex(dateStr);

    // 13. Update history.json
    updateHistory(history, selectedFiles, questionsPerDay, dateStr);

    console.log('Done!');
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function scanWikiFiles(wikiDirs) {
    const files = [];
    for (const dir of wikiDirs) {
        const dirPath = path.join(WIKI_DIR, dir);
        if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
            console.log(`Skipping non-existent directory: ${dirPath}`);
            continue;
        }
        collectMarkdownFiles(dirPath, files);
    }
    return files;
}

function collectMarkdownFiles(dirPath, files) {
    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        if (fs.statSync(fullPath).isDirectory()) {
            collectMarkdownFiles(fullPath, files);
        } else if (entry.endsWith('.md')) {
            files.push(fullPath);
        }
    }
}

function loadHistory() {
    if (fs.existsSync(HISTORY_PATH)) {
        return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
    }
    return {
        usedWikiFiles: {},
        totalQuestionsGenerated: 0,
        lastGenerated: null
    };
}

function selectFiles(wikiFiles, history, min, max) {
    const usedFiles = history.usedWikiFiles || {};

    // Sort by usage count (least used first)
    const sorted = wikiFiles.map(f => {
        const key = wikiFileKey(f);
        const usageCount = usedFiles[key] ? usedFiles[key].length : 0;
        return { path: f, key, usageCount };
    }).sort((a, b) => a.usageCount - b.usageCount);

    // Select between min and max files
    const count = Math.min(max, Math.max(min, sorted.length));
    return sorted.slice(0, count).map(s => s.path);
}

function wikiFileKey(filePath) {
    // Convert ./_wiki/network/network-polling.md -> network/network-polling
    return filePath
        .replace(/^\.?\/?_wiki\//, '')
        .replace(/\.md$/, '');
}

function parseWikiFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const parts = content.split('---');

    let frontMatter = {};
    let body = '';

    if (parts.length >= 3) {
        const rawFM = parts[1];
        frontMatter = parseFrontMatter(rawFM);
        body = parts.slice(2).join('---').trim();
    } else {
        body = content;
    }

    // Truncate body
    if (body.length > MAX_CONTENT_LENGTH) {
        body = body.substring(0, MAX_CONTENT_LENGTH) + '...';
    }

    const key = wikiFileKey(filePath);
    const url = `/wiki/${key}`;

    return {
        key,
        title: frontMatter.title || key,
        summary: frontMatter.summary || '',
        tags: frontMatter.tag ? frontMatter.tag.split(/\s+/) : [],
        url,
        body
    };
}

function parseFrontMatter(raw) {
    const result = {};
    const lines = raw.split('\n');
    for (const line of lines) {
        const match = /^\s*([^:]+):\s*(.+)\s*$/.exec(line);
        if (match) {
            const key = match[1].trim();
            let val = match[2].trim();
            // Remove wiki link markers
            val = val.replace(/\[{2}\/?|\]{2}/g, '');
            // Remove surrounding quotes
            val = val.replace(/^["']|["']$/g, '');
            result[key] = val;
        }
    }
    return result;
}

async function generateQuestions(parsedFiles, topic, questionsPerDay) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error('ANTHROPIC_API_KEY environment variable is not set');
        process.exit(1);
    }

    const client = new Anthropic({ apiKey });

    const docsSection = parsedFiles.map(f =>
        `### ${f.title}\n- URL: ${f.url}\n- Tags: ${f.tags.join(', ')}\n- Summary: ${f.summary}\n\n${f.body}`
    ).join('\n\n---\n\n');

    const prompt = `당신은 시니어/스태프 소프트웨어 엔지니어 면접관입니다.

아래 기술 문서 내용을 바탕으로 시니어 엔지니어 수준의 면접 질문을 ${questionsPerDay}개 생성해주세요.

## 규칙
1. 질문은 반드시 한글로 작성합니다.
2. 답변은 생성하지 않습니다. 질문만 생성합니다.
3. 각 질문은 깊이 있는 사고와 실무 경험을 요구해야 합니다.
4. 단순 암기형이 아닌, 설계/판단/트레이드오프를 묻는 질문이어야 합니다.
5. 반드시 아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요.

## 오늘의 주제: ${topic}

## 참고 문서
${docsSection}

## 출력 형식 (JSON array만 반환)
[
  {
    "question": "질문 내용",
    "tags": ["tag1", "tag2"],
    "references": [
      { "title": "문서 제목", "url": "/wiki/path/" }
    ]
  }
]`;

    console.log('Calling Claude API...');

    const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = responseText.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
    }

    const questions = JSON.parse(jsonStr);

    if (!Array.isArray(questions)) {
        throw new Error('API response is not a JSON array');
    }

    return questions;
}

function updateIndex(dateStr) {
    let index = [];
    if (fs.existsSync(INDEX_PATH)) {
        index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    }

    // Prepend new date (avoid duplicates)
    if (!index.includes(dateStr)) {
        index.unshift(dateStr);
    }

    fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
    console.log(`Updated: ${INDEX_PATH}`);
}

function updateHistory(history, selectedFiles, questionsCount, dateStr) {
    const usedWikiFiles = history.usedWikiFiles || {};

    for (const filePath of selectedFiles) {
        const key = wikiFileKey(filePath);
        if (!usedWikiFiles[key]) {
            usedWikiFiles[key] = [];
        }
        if (!usedWikiFiles[key].includes(dateStr)) {
            usedWikiFiles[key].push(dateStr);
        }
    }

    const updated = {
        usedWikiFiles,
        totalQuestionsGenerated: (history.totalQuestionsGenerated || 0) + questionsCount,
        lastGenerated: dateStr
    };

    fs.writeFileSync(HISTORY_PATH, JSON.stringify(updated, null, 2));
    console.log(`Updated: ${HISTORY_PATH}`);
}
