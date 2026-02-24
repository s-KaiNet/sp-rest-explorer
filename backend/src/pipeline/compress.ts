import { compressToUTF16 } from 'lz-string';

/**
 * Compress a JSON string using lz-string's UTF-16 encoding.
 *
 * Thin wrapper that gives a named function for the pipeline and a
 * single place to change compression strategy if needed.
 *
 * @param json - Stringified JSON to compress.
 * @returns The lz-string UTF-16 compressed string.
 */
export function compressJson(json: string): string {
  return compressToUTF16(json);
}
