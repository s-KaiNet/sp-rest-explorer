import { decompressFromUTF16 } from 'lz-string'
import { getHistoricalBlobUrl } from '@/lib/constants'
import type { Metadata } from '@/lib/metadata/types'

// ── Public API ──

/**
 * Fetch, decompress, and parse a historical metadata blob for the given year/month.
 *
 * Returns `null` when the blob doesn't exist (HTTP 404) — this is expected for
 * months before the backend started producing snapshots.
 *
 * Throws on non-404 network errors so the caller (diff-store) can set error status.
 */
export async function fetchHistoricalBlob(
  year: number,
  month: number,
): Promise<Metadata | null> {
  const url = getHistoricalBlobUrl(year, month)
  const res = await fetch(url)

  if (res.status === 404) return null

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }

  const compressed = await res.text()
  const json = decompressFromUTF16(compressed)

  if (json === null) {
    throw new Error('Decompression failed: decompressFromUTF16 returned null')
  }

  return JSON.parse(json) as Metadata
}

/**
 * Return the year/month for "one month ago" from the current date.
 *
 * Example: Feb 2026 -> { year: 2026, month: 1 }
 * Handles January wrapping: Jan 2026 -> { year: 2025, month: 12 }
 */
export function getDefaultComparisonDate(): { year: number; month: number } {
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-indexed
  const currentYear = now.getFullYear()

  if (currentMonth === 1) {
    return { year: currentYear - 1, month: 12 }
  }

  return { year: currentYear, month: currentMonth - 1 }
}
