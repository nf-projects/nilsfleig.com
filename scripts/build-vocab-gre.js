#!/usr/bin/env node

/**
 * Build vocabulary data from GRE word lists + wiktionary definitions.
 * Focuses on eloquent, professional vocabulary.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const VOCAB_DATA_DIR = path.join(__dirname, '..', 'vocab-data');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'vocab');

interface WordData {
  id: string;
  word: string;
  rank: number;
  difficulty: number;
  pos: string[];
  definitions: { pos: string; def: string; examples?: string[] }[];
  ipa?: string;
  sentences: string[];
}

interface WiktionaryEntry {
  word: string;
  pos: string;
  senses?: Array<{
    glosses?: string[];
    tags?: string[];
    examples?: Array<{ text: string }>;
  }>;
  sounds?: Array<{ ipa?: string }>;
}

// Patterns to filter out bad definitions
const BAD_DEF_PATTERNS = [
  /^plural of /i,
  /^past tense of /i,
  /^past participle of /i,
  /^present participle of /i,
  /^third-person singular/i,
  /^simple past/i,
  /^alternative spelling/i,
  /^alternative form/i,
  /^obsolete form/i,
  /^archaic form/i,
  /^misspelling/i,
  /^abbreviation/i,
  /^initialism/i,
  /^acronym/i,
];

// Technical domains to filter out
const TECHNICAL_TAGS = [
  'medicine', 'medical', 'anatomy', 'chemistry', 'biology', 'physics',
  'mathematics', 'computing', 'programming', 'legal', 'law',
  'botany', 'zoology', 'geology', 'astronomy', 'biochemistry',
  'pharmacology', 'pathology', 'surgery', 'dentistry',
];

// Good POS for vocabulary learning
const GOOD_POS = new Set(['noun', 'verb', 'adj', 'adjective', 'adv', 'adverb']);

async function* readJsonLines<T>(filePath: string): AsyncGenerator<T> {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.trim()) {
      try { yield JSON.parse(line) as T; } catch (e) {}
    }
  }
}

function isGoodDefinition(def: string, tags: string[] = []): boolean {
  // Check for bad patterns
  for (const pattern of BAD_DEF_PATTERNS) {
    if (pattern.test(def)) return false;
  }

  // Check for technical tags
  const tagStr = tags.join(' ').toLowerCase();
  for (const tech of TECHNICAL_TAGS) {
    if (tagStr.includes(tech)) return false;
  }

  // Must be substantive
  if (def.length < 15 || def.length > 300) return false;

  return true;
}

function normalizePos(pos: string): string | null {
  const map: Record<string, string> = {
    'noun': 'n', 'verb': 'v', 'adj': 'adj', 'adjective': 'adj',
    'adv': 'adv', 'adverb': 'adv',
  };
  return map[pos.toLowerCase()] || null;
}

async function loadGREWords(): Promise<Set<string>> {
  console.log('Loading GRE word list...');
  const filePath = path.join(VOCAB_DATA_DIR, 'gre_combined.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const words = new Set<string>();

  for (const line of content.split('\n')) {
    const word = line.trim().toLowerCase();
    if (word && /^[a-z]{3,}$/.test(word)) {
      words.add(word);
    }
  }

  console.log(`  Loaded ${words.size} GRE words`);
  return words;
}

async function loadFrequencyRanks(): Promise<Map<string, number>> {
  console.log('Loading frequency ranks...');
  const filePath = path.join(VOCAB_DATA_DIR, 'english_valid_words_freq.jsonl');
  const ranks = new Map<string, number>();

  for await (const entry of readJsonLines<{ Rank: number; Word: string }>(filePath)) {
    if (entry.Word && entry.Rank) {
      ranks.set(entry.Word.toLowerCase(), entry.Rank);
    }
  }

  console.log(`  Loaded ${ranks.size} frequency ranks`);
  return ranks;
}

async function loadIPAData(): Promise<Map<string, string>> {
  console.log('Loading IPA data...');
  const filePath = path.join(VOCAB_DATA_DIR, 'english_words_ipa.jsonl');
  const ipaMap = new Map<string, string>();

  for await (const entry of readJsonLines<{ token_ort: string; token_ipa: string }>(filePath)) {
    if (entry.token_ort && entry.token_ipa) {
      ipaMap.set(entry.token_ort.toLowerCase(), entry.token_ipa);
    }
  }

  console.log(`  Loaded ${ipaMap.size} IPA entries`);
  return ipaMap;
}

async function loadWiktionaryDefinitions(
  targetWords: Set<string>
): Promise<Map<string, { definitions: { pos: string; def: string; examples?: string[] }[]; ipa?: string }>> {
  console.log('Loading Wiktionary definitions...');
  const filePath = path.join(VOCAB_DATA_DIR, 'wiktionary_english.jsonl');
  const defMap = new Map();

  for await (const entry of readJsonLines<WiktionaryEntry>(filePath)) {
    if (!entry.word || !targetWords.has(entry.word.toLowerCase())) continue;

    const word = entry.word.toLowerCase();
    const pos = normalizePos(entry.pos || '');

    if (!pos || !entry.senses?.length) continue;

    const definitions: { pos: string; def: string; examples?: string[] }[] = [];

    for (const sense of entry.senses.slice(0, 3)) {
      if (!sense.glosses?.length) continue;

      const def = sense.glosses[0]
        .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2')
        .replace(/\{\{[^}]+\}\}/g, '')
        .trim();

      if (!isGoodDefinition(def, sense.tags)) continue;

      const examples = sense.examples?.slice(0, 2).map(e => e.text).filter(t => t && t.length < 150) || [];
      definitions.push({ pos, def, examples: examples.length ? examples : undefined });
    }

    if (!definitions.length) continue;

    // Extract IPA
    let ipa: string | undefined;
    if (entry.sounds?.length) {
      const ipaEntry = entry.sounds.find(s => s.ipa);
      if (ipaEntry?.ipa) ipa = ipaEntry.ipa;
    }

    if (defMap.has(word)) {
      const existing = defMap.get(word)!;
      existing.definitions.push(...definitions);
      if (!existing.ipa && ipa) existing.ipa = ipa;
    } else {
      defMap.set(word, { definitions, ipa });
    }
  }

  console.log(`  Loaded definitions for ${defMap.size} words`);
  return defMap;
}

async function loadSentences(): Promise<Map<string, string[]>> {
  console.log('Loading example sentences...');
  const filePath = path.join(VOCAB_DATA_DIR, 'high_quality_sentences.jsonl');
  const sentenceMap = new Map<string, string[]>();

  for await (const entry of readJsonLines<{ text: string }>(filePath)) {
    if (!entry.text || entry.text.length > 200) continue;
    const words = entry.text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const uniqueWords = new Set(words);
    for (const word of Array.from(uniqueWords)) {
      if (!sentenceMap.has(word)) sentenceMap.set(word, []);
      const sentences = sentenceMap.get(word)!;
      if (sentences.length < 5) sentences.push(entry.text);
    }
  }

  console.log(`  Indexed sentences for ${sentenceMap.size} words`);
  return sentenceMap;
}

async function buildVocabData() {
  console.log('='.repeat(60));
  console.log('Building GRE vocabulary data...');
  console.log('='.repeat(60));

  const greWords = await loadGREWords();
  const [freqRanks, ipaData, wiktionaryData, sentenceData] = await Promise.all([
    loadFrequencyRanks(),
    loadIPAData(),
    loadWiktionaryDefinitions(greWords),
    loadSentences(),
  ]);

  console.log('\nBuilding final word entries...');
  const words: WordData[] = [];

  for (const word of Array.from(greWords)) {
    const wikiEntry = wiktionaryData.get(word);
    if (!wikiEntry || wikiEntry.definitions.length === 0) continue;

    // Get frequency rank (default to high rank if not found)
    const rank = freqRanks.get(word) || 100000;

    // Compute difficulty from rank (log scale, -3 to +3)
    const logRank = Math.log10(Math.max(100, rank));
    const logMax = Math.log10(100000);
    const difficulty = Math.round((((logRank - 2) / (logMax - 2)) * 6 - 3) * 100) / 100;

    const ipa = wikiEntry.ipa || ipaData.get(word);
    const sentences = sentenceData.get(word)?.slice(0, 3) || [];
    const pos = [...new Set(wikiEntry.definitions.map(d => d.pos))];

    words.push({
      id: word,
      word,
      rank,
      difficulty: Math.max(-3, Math.min(3, difficulty)),
      pos,
      definitions: wikiEntry.definitions.slice(0, 5),
      ipa,
      sentences,
    });
  }

  // Sort by difficulty
  words.sort((a, b) => a.difficulty - b.difficulty);

  console.log(`  Built ${words.length} word entries`);

  // Generate distractor pools
  console.log('\nGenerating distractor pools...');
  const distractors: Record<string, string[]> = {};
  for (let d = -3; d <= 3; d += 0.5) {
    const bandKey = d.toFixed(1);
    distractors[bandKey] = [];
    const bandWords = words.filter(w => w.difficulty >= d - 0.25 && w.difficulty < d + 0.25);
    for (const w of bandWords.slice(0, 200)) {
      for (const def of w.definitions.slice(0, 1)) {
        if (def.def.length >= 15 && def.def.length <= 100) {
          distractors[bandKey].push(def.def);
        }
      }
    }
  }

  // Write output
  console.log('\nWriting output files...');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const wordsPath = path.join(OUTPUT_DIR, 'words.json');
  fs.writeFileSync(wordsPath, JSON.stringify(words));
  console.log(`  Wrote ${wordsPath} (${(fs.statSync(wordsPath).size / 1024 / 1024).toFixed(2)} MB)`);

  const distractorsPath = path.join(OUTPUT_DIR, 'distractors.json');
  fs.writeFileSync(distractorsPath, JSON.stringify(distractors));
  console.log(`  Wrote ${distractorsPath}`);

  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  const index: Record<string, number> = {};
  for (const w of words) index[w.id] = w.rank;
  fs.writeFileSync(indexPath, JSON.stringify(index));
  console.log(`  Wrote ${indexPath}`);

  console.log('\n' + '='.repeat(60));
  console.log('Done!');
}

buildVocabData().catch(console.error);
