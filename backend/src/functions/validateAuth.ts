import 'dotenv/config';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import axios from 'axios';
import { getToken } from '../auth';

async function validateAuth(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Auth validation triggered');

  try {
    const token = await getToken();
    const spUrl = process.env.SP_URL ?? '';
    if (!spUrl) {
      throw new Error('Missing required environment variable: SP_URL');
    }

    const response = await axios.get(`${spUrl}/_api/web`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json;odata=verbose',
      },
    });

    return {
      status: 200,
      jsonBody: response.data,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    context.error('Auth validation failed:', message);
    return {
      status: 500,
      jsonBody: { error: message },
    };
  }
}

app.http('validateAuth', {
  methods: ['GET'],
  authLevel: 'function',
  handler: validateAuth,
});
