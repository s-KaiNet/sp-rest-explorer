import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseMetadata } from '../parse-metadata.js';
import type { Metadata } from '../interfaces.js';

const FIXTURES_DIR = resolve(__dirname, '..', '..', '..', '.test-fixtures');
const XML_URL = 'https://sprestapiexplorer.blob.core.windows.net/api-files/metadata.latest.xml';
const JSON_URL = 'https://sprestapiexplorer.blob.core.windows.net/api-files/metadata.latest.json';

let goldenXml: string;
let goldenJson: string;
let goldenMetadata: Metadata;

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

/**
 * Find the first divergence point between two strings and return a diagnostic message.
 */
function findDivergence(a: string, b: string): string {
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    if (a[i] !== b[i]) {
      const context = 80;
      const start = Math.max(0, i - context);
      const aSnippet = a.substring(start, i + context);
      const bSnippet = b.substring(start, i + context);
      return `First divergence at index ${i}:\n  New:    ...${aSnippet}...\n  Golden: ...${bSnippet}...`;
    }
  }
  if (a.length !== b.length) {
    return `Lengths differ: new=${a.length}, golden=${b.length}`;
  }
  return 'Strings are identical';
}

describe('parseMetadata', () => {
  beforeAll(async () => {
    goldenXml = await downloadOrCache(XML_URL, 'metadata.latest.xml');
    goldenJson = await downloadOrCache(JSON_URL, 'metadata.latest.json');
    // Normalize golden JSON from pretty-printed to compact
    goldenMetadata = JSON.parse(goldenJson) as Metadata;
  }, 60_000); // 60s timeout for downloads

  it('produces byte-identical JSON to golden reference', async () => {
    const newMetadata = await parseMetadata(goldenXml);
    const newJson = JSON.stringify(newMetadata);
    const normalizedGoldenJson = JSON.stringify(goldenMetadata);

    if (newJson !== normalizedGoldenJson) {
      const divergence = findDivergence(newJson, normalizedGoldenJson);
      expect.fail(`JSON output is NOT byte-identical to golden reference.\n${divergence}`);
    }

    expect(newJson).toBe(normalizedGoldenJson);
  }, 30_000);

  it('parses entities with correct structure', async () => {
    const metadata = await parseMetadata(goldenXml);

    expect(metadata.entities).toBeDefined();
    expect(Object.keys(metadata.entities).length).toBeGreaterThan(0);

    // SP.Web is a well-known entity that must exist
    const spWeb = metadata.entities['SP.Web'];
    expect(spWeb).toBeDefined();
    expect(spWeb.name).toBe('Web');
    expect(spWeb.fullName).toBe('SP.Web');
    expect(Array.isArray(spWeb.properties)).toBe(true);
    expect(spWeb.properties.length).toBeGreaterThan(0);
    expect(Array.isArray(spWeb.functionIds)).toBe(true);
    expect(Array.isArray(spWeb.navigationProperties)).toBe(true);
  }, 30_000);

  it('parses functions with correct IDs and names', async () => {
    const metadata = await parseMetadata(goldenXml);

    expect(metadata.functions).toBeDefined();
    const funcIds = Object.keys(metadata.functions).map(Number);
    expect(funcIds.length).toBeGreaterThan(0);

    // All function IDs must be positive integers
    for (const id of funcIds) {
      expect(id).toBeGreaterThan(0);
      expect(Number.isInteger(id)).toBe(true);
    }

    // No function name should contain "Internal"
    for (const id of funcIds) {
      const func = metadata.functions[id];
      expect(func.name).not.toContain('Internal');
    }

    // The alias 'search' should exist (from Microsoft_Office_Server_Search_REST_SearchService)
    const funcNames = funcIds.map(id => metadata.functions[id].name);
    expect(funcNames).toContain('search');
  }, 30_000);

  it('creates Collection() entity types', async () => {
    const metadata = await parseMetadata(goldenXml);

    const collectionEntities = Object.keys(metadata.entities).filter(
      key => key.startsWith('Collection(')
    );
    expect(collectionEntities.length).toBeGreaterThan(0);
  }, 30_000);

  it('links functions to entities via functionIds', async () => {
    const metadata = await parseMetadata(goldenXml);

    // Find an entity with non-empty functionIds
    const entityWithFunctions = Object.values(metadata.entities).find(
      e => e.functionIds.length > 0
    );
    expect(entityWithFunctions).toBeDefined();

    // Each functionId must map to a function in metadata.functions
    for (const fId of entityWithFunctions!.functionIds) {
      expect(metadata.functions[fId]).toBeDefined();
    }
  }, 30_000);
});
