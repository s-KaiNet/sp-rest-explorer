import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { decompressFromUTF16 } from 'lz-string';
import { parseMetadata } from '../parse-metadata.js';
import { compressJson } from '../compress.js';
import type { Metadata } from '../interfaces.js';

const FIXTURES_DIR = resolve(__dirname, '..', '..', '..', '.test-fixtures');
const XML_URL = 'https://sprestapiexplorer.blob.core.windows.net/api-files/metadata.latest.xml';
const JSON_URL = 'https://sprestapiexplorer.blob.core.windows.net/api-files/metadata.latest.json';

/**
 * Downloads a URL and caches to local .test-fixtures/ directory.
 * Only downloads if the cached file doesn't exist.
 */
async function downloadOrCache(url: string, filename: string): Promise<string> {
  if (!existsSync(FIXTURES_DIR)) {
    mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  const filepath = resolve(FIXTURES_DIR, filename);
  if (existsSync(filepath)) {
    return readFileSync(filepath, 'utf-8');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  writeFileSync(filepath, text, 'utf-8');
  return text;
}

describe('pipeline integration', () => {
  let goldenXml: string;
  let goldenJson: string;
  let goldenMetadata: Metadata;

  beforeAll(async () => {
    goldenXml = await downloadOrCache(XML_URL, 'metadata.latest.xml');
    goldenJson = await downloadOrCache(JSON_URL, 'metadata.latest.json');
    goldenMetadata = JSON.parse(goldenJson) as Metadata;
  }, 60_000);

  it('runPipeline stages compose: XML → parse → compact JSON → compress → decompress = original', async () => {
    // Step 1: Parse golden XML
    const metadata = await parseMetadata(goldenXml);

    // Step 2: Compact JSON (no indentation)
    const json = JSON.stringify(metadata);

    // Step 3: Compress
    const compressed = compressJson(json);

    // Step 4: Decompress and verify round-trip
    const decompressed = decompressFromUTF16(compressed);
    expect(decompressed).toBe(json);

    // Step 5: Verify matches golden reference (compact-normalized)
    const normalizedGoldenJson = JSON.stringify(goldenMetadata);
    expect(json).toBe(normalizedGoldenJson);
  }, 30_000);

  it('PipelineResult json is compact (no indentation)', async () => {
    const metadata = await parseMetadata(goldenXml);
    const json = JSON.stringify(metadata);

    // No newlines = no pretty-printing
    expect(json).not.toContain('\n');

    // Idempotent: already compact
    expect(JSON.stringify(JSON.parse(json))).toBe(json);
  }, 30_000);
});
