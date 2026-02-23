import 'dotenv/config';
import { app, InvocationContext, Timer } from '@azure/functions';
import { handleMetadataGeneration } from '../handlers/metadata-handler.js';

async function generateMetadata(
  timer: Timer,
  context: InvocationContext,
): Promise<void> {
  context.log('Timer-triggered metadata generation started');

  if (timer.isPastDue) {
    context.log('Timer is past due — running immediately');
  }

  // Let errors propagate so the retry policy can activate
  await handleMetadataGeneration(context);
}

app.timer('generateMetadata', {
  schedule: '%TIMER_SCHEDULE%',
  handler: generateMetadata,
  retry: {
    strategy: 'fixedDelay',
    maxRetryCount: 2,
    delayInterval: { minutes: 5 },
  },
});
