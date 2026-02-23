import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { decompressFromUTF16 } from 'lz-string';
import { compressJson } from '../compress.js';

const FIXTURES_DIR = resolve(__dirname, '..', '..', '..', '.test-fixtures');
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

describe('compressJson', () => {
  let goldenJson: string;
  let compactGoldenJson: string;

  beforeAll(async () => {
    goldenJson = await downloadOrCache(JSON_URL, 'metadata.latest.json');
    // Normalize: parse and re-stringify compact (no indentation)
    compactGoldenJson = JSON.stringify(JSON.parse(goldenJson));
  }, 60_000);

  it('compresses and decompresses to identical string', () => {
    const json = JSON.stringify({ entities: { 'SP.Web': { name: 'Web' } }, functions: {} });
    const compressed = compressJson(json);
    const decompressed = decompressFromUTF16(compressed);

    expect(decompressed).toBe(json);
  });

  it('round-trips real golden reference JSON', () => {
    const compressed = compressJson(compactGoldenJson);
    const decompressed = decompressFromUTF16(compressed);

    expect(decompressed).toBe(compactGoldenJson);
  });

  it('compressed output is smaller than input', () => {
    const compressed = compressJson(compactGoldenJson);

    expect(compressed.length).toBeLessThan(compactGoldenJson.length);
  });
});
