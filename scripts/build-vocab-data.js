#!/usr/bin/env node

/**
 * Build vocabulary data from various sources into a single optimized JSON file.
 *
 * Sources:
 * - COCA frequency data -> word rankings and base difficulty
 * - Wiktionary -> definitions, POS, examples
 * - IPA data -> pronunciations
 * - CEFR database -> proficiency levels
 * - High quality sentences -> example usage
 *
 * Output: public/vocab/words.json
 *
 * Run with: npx tsx scripts/build-vocab-data.ts
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ============================================================================
// Types
// ============================================================================

interface WordData {
  id: string;
  word: string;
  rank: number;
  difficulty: number;
  pos: string[];
  definitions: Definition[];
  ipa?: string;
  sentences: string[];
  cefr?: string;
}

interface Definition {
  pos: string;
  def: string;
  examples?: string[];
}

interface WiktionaryEntry {
  word: string;
  pos: string;
  senses?: Array<{
    glosses?: string[];
    examples?: Array<{ text: string }>;
  }>;
  sounds?: Array<{ ipa?: string }>;
}

interface COCAEntry {
  rank: number;
  lemma: string;
  pos: string;
  freq: number;
}

// ============================================================================
// Configuration
// ============================================================================

const VOCAB_DATA_DIR = path.join(__dirname, '..', 'vocab-data');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'vocab');

const MIN_RANK = 1;
const MAX_RANK = 50000; // Top 50k words for full range
const MIN_DEFINITIONS = 1;

// POS we care about (content words)
const VALID_POS = new Set(['noun', 'verb', 'adj', 'adv', 'adjective', 'adverb', 'n', 'v']);
const POS_MAP: Record<string, string> = {
  'noun': 'n',
  'verb': 'v',
  'adj': 'adj',
  'adjective': 'adj',
  'adv': 'adv',
  'adverb': 'adv',
  'n': 'n',
  'v': 'v',
};

// ============================================================================
// Utility Functions
// ============================================================================

function normalizePos(pos: string): string | null {
  const lower = pos.toLowerCase();
  return POS_MAP[lower] || null;
}

function computeDifficulty(rank: number): number {
  // Map rank to [-3, +3] range using log scale
  // rank 1 -> -3 (easiest), rank 20000 -> +3 (hardest)
  const logRank = Math.log10(Math.max(1, rank));
  const logMax = Math.log10(MAX_RANK);
  return ((logRank / logMax) * 6) - 3;
}

function cleanDefinition(def: string): string {
  // Remove wiki markup and clean up
  return def
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2') // [[link|text]] -> text
    .replace(/\{\{[^}]+\}\}/g, '') // Remove templates
    .replace(/\s+/g, ' ')
    .trim();
}

async function* readJsonLines<T>(filePath: string): AsyncGenerator<T> {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        yield JSON.parse(line) as T;
      } catch (e) {
        // Skip malformed lines
      }
    }
  }
}

// ============================================================================
// Data Loading
// ============================================================================

async function loadFrequencyData(): Promise<Map<string, COCAEntry>> {
  console.log('Loading frequency data from english_valid_words_freq.jsonl...');
  const filePath = path.join(VOCAB_DATA_DIR, 'english_valid_words_freq.jsonl');

  const freqMap = new Map<string, COCAEntry>();

  for await (const entry of readJsonLines<{ Rank: number; Word: string }>(filePath)) {
    if (!entry.Word || !entry.Rank) continue;

    const rank = entry.Rank;
    const lemma = entry.Word.toLowerCase().trim();

    // Skip non-alphabetic words, very short words, and words with numbers
    if (!/^[a-z]{2,}$/.test(lemma)) continue;

    if (rank >= MIN_RANK && rank <= MAX_RANK && !freqMap.has(lemma)) {
      freqMap.set(lemma, { rank, lemma, pos: '', freq: 0 });
    }
  }

  console.log(`  Loaded ${freqMap.size} words from frequency data`);
  return freqMap;
}

async function loadIPAData(): Promise<Map<string, string>> {
  console.log('Loading IPA pronunciation data...');
  const filePath = path.join(VOCAB_DATA_DIR, 'english_words_ipa.jsonl');
  const ipaMap = new Map<string, string>();

  for await (const entry of readJsonLines<{ token_ort: string; token_ipa: string }>(filePath)) {
    if (entry.token_ort && entry.token_ipa) {
      const word = entry.token_ort.toLowerCase().trim();
      if (!ipaMap.has(word)) {
        ipaMap.set(word, entry.token_ipa);
      }
    }
  }

  console.log(`  Loaded ${ipaMap.size} IPA entries`);
  return ipaMap;
}

async function loadSentences(): Promise<Map<string, string[]>> {
  console.log('Loading example sentences...');
  const filePath = path.join(VOCAB_DATA_DIR, 'high_quality_sentences.jsonl');
  const sentenceMap = new Map<string, string[]>();

  // Build word -> sentences index (limited to 5 per word)
  for await (const entry of readJsonLines<{ text: string }>(filePath)) {
    if (!entry.text || entry.text.length > 200) continue;

    // Extract words and index
    const words = entry.text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const uniqueWords = new Set(words);

    for (const word of Array.from(uniqueWords)) {
      if (!sentenceMap.has(word)) {
        sentenceMap.set(word, []);
      }
      const sentences = sentenceMap.get(word)!;
      if (sentences.length < 5) {
        sentences.push(entry.text);
      }
    }
  }

  console.log(`  Indexed sentences for ${sentenceMap.size} words`);
  return sentenceMap;
}

async function loadWiktionaryDefinitions(
  targetWords: Set<string>
): Promise<Map<string, { definitions: Definition[]; ipa?: string }>> {
  console.log('Loading Wiktionary definitions...');
  const filePath = path.join(VOCAB_DATA_DIR, 'wiktionary_english.jsonl');
  const defMap = new Map<string, { definitions: Definition[]; ipa?: string }>();

  for await (const entry of readJsonLines<WiktionaryEntry>(filePath)) {
    if (!entry.word || !targetWords.has(entry.word.toLowerCase())) continue;

    const word = entry.word.toLowerCase();
    const pos = normalizePos(entry.pos || '');

    if (!pos || !entry.senses?.length) continue;

    // Extract definitions
    const definitions: Definition[] = [];
    for (const sense of entry.senses.slice(0, 3)) { // Max 3 senses per POS
      if (!sense.glosses?.length) continue;

      const def = cleanDefinition(sense.glosses[0]);
      if (def.length < 5 || def.length > 200) continue;

      const examples = sense.examples
        ?.slice(0, 2)
        .map(e => e.text)
        .filter(t => t && t.length < 150) || [];

      definitions.push({ pos, def, examples: examples.length ? examples : undefined });
    }

    if (!definitions.length) continue;

    // Extract IPA
    let ipa: string | undefined;
    if (entry.sounds?.length) {
      const ipaEntry = entry.sounds.find(s => s.ipa);
      if (ipaEntry?.ipa) {
        ipa = ipaEntry.ipa;
      }
    }

    // Merge with existing entry
    if (defMap.has(word)) {
      const existing = defMap.get(word)!;
      existing.definitions.push(...definitions);
      if (!existing.ipa && ipa) {
        existing.ipa = ipa;
      }
    } else {
      defMap.set(word, { definitions, ipa });
    }
  }

  console.log(`  Loaded definitions for ${defMap.size} words`);
  return defMap;
}

// ============================================================================
// Main Build Process
// ============================================================================

async function buildVocabData() {
  console.log('='.repeat(60));
  console.log('Building vocabulary data...');
  console.log('='.repeat(60));

  // Step 1: Load frequency data to get our target word list
  const cocaData = await loadFrequencyData();
  const targetWords = new Set(cocaData.keys());

  // Step 2: Load supporting data
  const [ipaData, sentenceData, wiktionaryData] = await Promise.all([
    loadIPAData(),
    loadSentences(),
    loadWiktionaryDefinitions(targetWords),
  ]);

  // Step 3: Build final word entries
  console.log('\nBuilding final word entries...');
  const words: WordData[] = [];

  for (const [word, coca] of Array.from(cocaData)) {
    // Skip if no definitions
    const wikiEntry = wiktionaryData.get(word);
    if (!wikiEntry || wikiEntry.definitions.length < MIN_DEFINITIONS) continue;

    // Get IPA (prefer wiktionary, fallback to IPA dataset)
    const ipa = wikiEntry.ipa || ipaData.get(word);

    // Get sentences
    const sentences = sentenceData.get(word)?.slice(0, 3) || [];

    // Extract unique POS
    const pos = Array.from(new Set(wikiEntry.definitions.map(d => d.pos)));

    // Compute difficulty from rank
    const difficulty = computeDifficulty(coca.rank);

    words.push({
      id: word,
      word,
      rank: coca.rank,
      difficulty: Math.round(difficulty * 100) / 100,
      pos,
      definitions: wikiEntry.definitions.slice(0, 5), // Max 5 definitions
      ipa,
      sentences,
    });
  }

  // Sort by rank
  words.sort((a, b) => a.rank - b.rank);

  console.log(`  Built ${words.length} word entries`);

  // Step 4: Generate distractor pools
  console.log('\nGenerating distractor pools...');
  const distractors = generateDistractorPools(words);

  // Step 5: Write output files
  console.log('\nWriting output files...');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Main word data
  const wordsPath = path.join(OUTPUT_DIR, 'words.json');
  fs.writeFileSync(wordsPath, JSON.stringify(words, null, 0));
  console.log(`  Wrote ${wordsPath} (${(fs.statSync(wordsPath).size / 1024 / 1024).toFixed(2)} MB)`);

  // Distractor pools
  const distractorsPath = path.join(OUTPUT_DIR, 'distractors.json');
  fs.writeFileSync(distractorsPath, JSON.stringify(distractors, null, 0));
  console.log(`  Wrote ${distractorsPath} (${(fs.statSync(distractorsPath).size / 1024).toFixed(2)} KB)`);

  // Word index (id -> rank for quick lookup)
  const index: Record<string, number> = {};
  for (const w of words) {
    index[w.id] = w.rank;
  }
  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index));
  console.log(`  Wrote ${indexPath} (${(fs.statSync(indexPath).size / 1024).toFixed(2)} KB)`);

  console.log('\n' + '='.repeat(60));
  console.log('Done!');
  console.log('='.repeat(60));
}

function generateDistractorPools(words: WordData[]): Record<string, string[]> {
  // Group definitions by difficulty band for distractor selection
  const pools: Record<string, string[]> = {};

  // Create bands from -3 to +3 in 0.5 increments
  for (let d = -3; d <= 3; d += 0.5) {
    const bandKey = d.toFixed(1);
    pools[bandKey] = [];

    // Find words in this difficulty band
    const bandWords = words.filter(w =>
      w.difficulty >= d - 0.25 &&
      w.difficulty < d + 0.25 &&
      w.definitions.length > 0
    );

    // Extract definitions as potential distractors
    for (const w of bandWords.slice(0, 200)) { // Max 200 per band
      for (const def of w.definitions.slice(0, 1)) {
        if (def.def.length >= 10 && def.def.length <= 80) {
          pools[bandKey].push(def.def);
        }
      }
    }
  }

  return pools;
}

// Run
buildVocabData().catch(console.error);
