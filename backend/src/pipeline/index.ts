/**
 * Pipeline orchestrator and barrel export.
 *
 * Phase 20 imports everything it needs from this single entry point:
 *   import { runPipeline, fetchMetadataXml, parseMetadata, compressJson } from './pipeline/index.js';
 */

export { fetchMetadataXml } from './fetch-metadata.js';
export { parseMetadata } from './parse-metadata.js';
export { compressJson } from './compress.js';
export type {
  Metadata,
  EntityType,
  FunctionImport,
  Property,
  NavigationProperty,
  Parameter,
  Association,
} from './interfaces.js';

import { fetchMetadataXml } from './fetch-metadata.js';
import { parseMetadata } from './parse-metadata.js';
import { compressJson } from './compress.js';

/** Result of a full pipeline run: raw XML, compact JSON, and compressed JSON. */
export interface PipelineResult {
  readonly xml: string;           // Raw XML from SharePoint
  readonly json: string;          // Compact JSON.stringify(metadata)
  readonly compressedJson: string; // lz-string compressToUTF16(json)
}

/**
 * Orchestrate the full data pipeline: fetch → parse → compress.
 *
 * @param token - Bearer access token for SharePoint.
 * @param spUrl - SharePoint site root URL (e.g. `https://contoso.sharepoint.com`).
 * @returns All three pipeline artifacts (xml, json, compressedJson).
 */
export async function runPipeline(token: string, spUrl: string): Promise<PipelineResult> {
  const xml = await fetchMetadataXml(token, spUrl);
  const metadata = await parseMetadata(xml);
  const json = JSON.stringify(metadata);  // Compact, no indentation (PROC-03)
  const compressedJson = compressJson(json);
  return { xml, json, compressedJson };
}
