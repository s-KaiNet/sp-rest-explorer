import { describe, it, expect } from 'vitest';
import { buildBlobList, BlobDefinition } from '../blob-uploader.js';

/** Minimal mock matching the PipelineResult shape used by buildBlobList. */
const mockResult = {
  xml: '<xml>mock-xml-content</xml>',
  json: '{"entities":{}}',
  compressedJson: 'compressed-mock-\u00FF\u00FE',
};

describe('buildBlobList', () => {
  it('returns exactly 6 blob definitions', () => {
    const blobs = buildBlobList(mockResult as any, new Date('2026-02-23T01:00:00Z'));

    expect(blobs).toHaveLength(6);
  });

  it('latest blobs have correct names and content-types', () => {
    const blobs = buildBlobList(mockResult as any, new Date('2026-02-23T01:00:00Z'));

    expect(blobs[0]).toEqual<BlobDefinition>({
      name: 'metadata.latest.json',
      contentType: 'application/json',
      content: mockResult.json,
    });
    expect(blobs[1]).toEqual<BlobDefinition>({
      name: 'metadata.latest.xml',
      contentType: 'application/xml',
      content: mockResult.xml,
    });
    expect(blobs[2]).toEqual<BlobDefinition>({
      name: 'metadata.latest.zip.json',
      contentType: 'application/json',
      content: mockResult.compressedJson,
    });
  });

  it('monthly blobs use 1-indexed month from UTC date', () => {
    // January should be month 1 (not 0)
    const blobs = buildBlobList(mockResult as any, new Date('2026-01-15T01:00:00Z'));

    expect(blobs[3].name).toBe('2026y_m1_metadata.json');
    expect(blobs[4].name).toBe('2026y_m1_metadata.xml');
    expect(blobs[5].name).toBe('2026y_m1_metadata.zip.json');
  });

  it('December date produces month 12', () => {
    const blobs = buildBlobList(mockResult as any, new Date('2026-12-01T01:00:00Z'));

    expect(blobs[3].name).toContain('m12');
    expect(blobs[4].name).toContain('m12');
    expect(blobs[5].name).toContain('m12');
  });

  it('monthly blobs map content correctly', () => {
    const blobs = buildBlobList(mockResult as any, new Date('2026-06-15T01:00:00Z'));

    expect(blobs[3].content).toBe(mockResult.json);
    expect(blobs[3].contentType).toBe('application/json');
    expect(blobs[4].content).toBe(mockResult.xml);
    expect(blobs[4].contentType).toBe('application/xml');
    expect(blobs[5].content).toBe(mockResult.compressedJson);
    expect(blobs[5].contentType).toBe('application/json');
  });
});
