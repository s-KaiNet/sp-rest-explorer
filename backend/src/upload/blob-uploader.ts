/**
 * Blob upload module for Azure Blob Storage.
 *
 * Builds 6 blob definitions (3 latest + 3 monthly snapshots) and uploads
 * them sequentially to the `api-files` container with correct Content-Type headers.
 */

import { BlobServiceClient } from '@azure/storage-blob';
import { InvocationContext } from '@azure/functions';
import { PipelineResult } from '../pipeline/index.js';

const CONTAINER_NAME = 'api-files';

/** Shape of a single blob to upload. */
export interface BlobDefinition {
  name: string;
  content: string;
  contentType: string;
}

/**
 * Build the list of 6 blobs to upload from a pipeline result.
 *
 * Pure function — no side effects, easy to unit test.
 *
 * @param result - Pipeline output with xml, json, and compressedJson.
 * @param now - Current date (used for monthly snapshot naming).
 * @returns Array of exactly 6 blob definitions.
 */
export function buildBlobList(result: PipelineResult, now: Date): BlobDefinition[] {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1; // 1-indexed: January = 1, December = 12
  const prefix = `${year}y_m${month}_metadata`;

  return [
    { name: 'metadata.latest.json', content: result.json, contentType: 'application/json' },
    { name: 'metadata.latest.xml', content: result.xml, contentType: 'application/xml' },
    { name: 'metadata.latest.zip.json', content: result.compressedJson, contentType: 'application/json' },
    { name: `${prefix}.json`, content: result.json, contentType: 'application/json' },
    { name: `${prefix}.xml`, content: result.xml, contentType: 'application/xml' },
    { name: `${prefix}.zip.json`, content: result.compressedJson, contentType: 'application/json' },
  ];
}

/**
 * Upload 6 blobs to Azure Blob Storage sequentially.
 *
 * Creates the container if it doesn't exist (idempotent, self-healing).
 * Uploads one blob at a time — NOT in parallel.
 * If any upload fails, the error propagates (no rollback of already-uploaded blobs).
 *
 * @param context - Azure Functions invocation context for logging.
 * @param result - Pipeline output with xml, json, and compressedJson.
 * @param now - Current date (used for monthly snapshot naming).
 */
export async function uploadBlobs(
  context: InvocationContext,
  result: PipelineResult,
  now: Date,
): Promise<void> {
  const connectionString = process.env.AzureWebJobsStorage;
  if (!connectionString) {
    throw new Error('Missing AzureWebJobsStorage connection string environment variable');
  }

  const blobService = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobService.getContainerClient(CONTAINER_NAME);

  // Idempotent container creation with public blob access (BLOB-07)
  await containerClient.createIfNotExists({ access: 'blob' });

  const blobs = buildBlobList(result, now);

  // Sequential upload — one at a time, NOT Promise.all
  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i];
    const blockBlobClient = containerClient.getBlockBlobClient(blob.name);

    // CRITICAL: Use Buffer.byteLength for content length, not string.length
    // string.length counts UTF-16 code units; upload() needs byte count.
    // lz-string compressToUTF16 output has multi-byte chars where they differ.
    const contentLength = Buffer.byteLength(blob.content, 'utf-8');

    await blockBlobClient.upload(blob.content, contentLength, {
      blobHTTPHeaders: { blobContentType: blob.contentType },
    });

    context.log(`[upload] ${blob.name} uploaded (${i + 1}/${blobs.length})`);
  }
}
