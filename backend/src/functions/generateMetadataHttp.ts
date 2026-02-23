import 'dotenv/config';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { handleMetadataGeneration } from '../handlers/metadata-handler.js';

async function generateMetadataHttp(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log('HTTP-triggered metadata generation started');

  try {
    const result = await handleMetadataGeneration(context);
    return {
      status: 200,
      jsonBody: result,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const failedStage = err instanceof Error ? (err as any).failedStage : undefined;
    const stageTimings = err instanceof Error ? (err as any).stageTimings : undefined;

    return {
      status: 500,
      jsonBody: {
        status: 'error',
        stage: failedStage ?? 'unknown',
        error: message,
        stageTimings: stageTimings ?? {},
      },
    };
  }
}

app.http('generateMetadataHttp', {
  methods: ['POST'],
  authLevel: 'function',
  handler: generateMetadataHttp,
});
