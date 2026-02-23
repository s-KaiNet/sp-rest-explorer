import axios from 'axios';

/** Maximum number of fetch attempts before giving up. */
const MAX_RETRIES = 3;

/** Base delay in milliseconds for exponential backoff (doubles each retry). */
const BASE_DELAY_MS = 2_000;

/** Hard timeout per attempt in milliseconds (60 seconds). */
const TIMEOUT_MS = 60_000;

/**
 * Fetch the SharePoint OData `$metadata` XML document.
 *
 * Retries up to {@link MAX_RETRIES} times with exponential backoff on
 * network errors, 5xx responses, 429 throttling, and timeouts.
 * A 429 response with a `Retry-After` header uses that value as the
 * wait time instead of the exponential backoff.
 *
 * Each attempt is hard-capped at {@link TIMEOUT_MS} via `AbortController`.
 *
 * @param token - Bearer access token for SharePoint.
 * @param spUrl - SharePoint site root URL (e.g. `https://contoso.sharepoint.com`).
 * @returns The raw XML string from `_api/$metadata`.
 */
export async function fetchMetadataXml(
  token: string,
  spUrl: string,
): Promise<string> {
  const url = `${spUrl}/_api/$metadata`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await axios.get<string>(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        responseType: 'text',
        // Prevent axios from JSON.parse()-ing the XML response.
        transformResponse: [(data: string) => data],
      });

      clearTimeout(timeoutId);
      return response.data;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (attempt === MAX_RETRIES || !isRetryable(error)) {
        throw error;
      }

      const delay = getRetryDelay(error, attempt);
      await sleep(delay);
    }
  }

  // Unreachable — the loop either returns or throws.
  throw new Error('fetchMetadataXml: exhausted retries');
}

/**
 * Determine whether a failed request should be retried.
 *
 * Retryable conditions:
 * - Network error (no response received)
 * - Request cancelled / timed out (`ERR_CANCELED`)
 * - HTTP 429 (Too Many Requests)
 * - HTTP 5xx (server error)
 */
function isRetryable(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  // Network error — no response from server.
  if (!error.response) {
    return true;
  }

  // AbortController triggered (timeout).
  if (error.code === 'ERR_CANCELED') {
    return true;
  }

  const status = error.response.status;

  // 429 Too Many Requests.
  if (status === 429) {
    return true;
  }

  // 5xx server errors.
  if (status >= 500) {
    return true;
  }

  return false;
}

/**
 * Compute the delay before the next retry attempt.
 *
 * If the error is a 429 with a `Retry-After` header the server-specified
 * wait time (in seconds) is used.  Otherwise exponential backoff applies:
 * 2 000 ms × 2^(attempt − 1)  →  2 s, 4 s, 8 s.
 */
function getRetryDelay(error: unknown, attempt: number): number {
  if (axios.isAxiosError(error) && error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after'];
    if (retryAfter) {
      const seconds = parseInt(retryAfter as string, 10);
      if (!isNaN(seconds) && seconds > 0) {
        return seconds * 1_000;
      }
    }
  }

  return BASE_DELAY_MS * Math.pow(2, attempt - 1);
}

/** Promise-based sleep utility. */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
