/**
 * Shared orchestration handler for metadata generation.
 *
 * Wires auth -> pipeline -> upload into a single flow with structured
 * stage-level logging and timing.  Both the timer trigger and the HTTP
 * trigger delegate to `handleMetadataGeneration()`.
 */

import { InvocationContext } from '@azure/functions';
import { getToken } from '../auth.js';
import { runPipeline } from '../pipeline/index.js';
import { uploadBlobs } from '../upload/blob-uploader.js';

/** Summary returned by the handler after a successful (or failed) run. */
export interface HandlerResult {
  status: 'ok' | 'error';
  duration: number;
  blobsUploaded: number;
  stages: Record<string, { duration: number }>;
  error?: string;
  failedStage?: string;
}

/**
 * Orchestrate the full metadata-generation pipeline:
 * auth -> pipeline (fetch + parse + compress) -> upload.
 *
 * On success returns a `HandlerResult` with status `'ok'`.
 * On failure logs completed stage durations, attaches diagnostic
 * properties to the error, and re-throws so Azure Functions retry
 * policy can activate for the timer trigger.
 */
export async function handleMetadataGeneration(
  context: InvocationContext,
): Promise<HandlerResult> {
  // Log retry information if this is a retry attempt
  if (context.retryContext) {
    context.log(
      `[retry] attempt ${context.retryContext.retryCount} of ${context.retryContext.maxRetryCount}`,
    );
  }

  const overallStart = Date.now();
  const stageTimings: Record<string, { duration: number }> = {};

  try {
    // --- Auth stage ---
    let start = Date.now();
    const token = await getToken();
    const spUrl = process.env.SP_URL;
    if (!spUrl) {
      throw new Error('Missing required environment variable: SP_URL');
    }
    stageTimings.auth = { duration: Date.now() - start };
    context.log(`[stage:auth] completed in ${stageTimings.auth.duration}ms`);

    // --- Pipeline stage (fetch + parse + compress) ---
    start = Date.now();
    const result = await runPipeline(token, spUrl);
    stageTimings.pipeline = { duration: Date.now() - start };
    context.log(`[stage:pipeline] completed in ${stageTimings.pipeline.duration}ms`);

    // --- Upload stage ---
    const now = new Date(); // Fresh date per invocation — NOT module scope
    start = Date.now();
    await uploadBlobs(context, result, now);
    stageTimings.upload = { duration: Date.now() - start };
    context.log(`[stage:upload] completed in ${stageTimings.upload.duration}ms`);

    // --- Summary ---
    const duration = Date.now() - overallStart;
    context.log(`Pipeline complete: 6 blobs uploaded in ${duration}ms`);

    return {
      status: 'ok',
      duration,
      blobsUploaded: 6,
      stages: stageTimings,
    };
  } catch (err: unknown) {
    // Determine which stage failed based on which timings were recorded
    let failedStage: string;
    if (!stageTimings.auth) {
      failedStage = 'auth';
    } else if (!stageTimings.pipeline) {
      failedStage = 'pipeline';
    } else {
      failedStage = 'upload';
    }

    const message = err instanceof Error ? err.message : String(err);
    context.error(`[error] Pipeline failed at stage: ${failedStage} — ${message}`);

    // Log durations of all stages that DID complete
    for (const [stage, timing] of Object.entries(stageTimings)) {
      context.log(`[stage:${stage}] completed in ${timing.duration}ms (before failure)`);
    }

    // Attach diagnostic info to the error so the HTTP trigger can extract it
    if (err instanceof Error) {
      (err as any).stageTimings = stageTimings;
      (err as any).failedStage = failedStage;
    }

    // Re-throw so Azure Functions retry policy activates for the timer trigger
    throw err;
  }
}
