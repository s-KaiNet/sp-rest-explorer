// ── Types ──
export type {
  ChangeType,
  DiffChanges,
  DiffEntity,
  DiffFunction,
  DiffPropertyChange,
  DiffStatus,
} from './types'

// ── Diff computation ──
export { computeRawDiff } from './compute-diff'
export { transformDelta } from './transform-delta'

// ── Historical blob fetch ──
export { fetchHistoricalBlob, getDefaultComparisonDate } from './fetch-historical'

// ── Diff store (reactive singleton) ──
export {
  useDiffSnapshot,
  useDiffStatus,
  useDiffError,
  getDiffResult,
  getDiffStatus,
  getDiffError,
  computeDiff,
  resetDiff,
} from './diff-store'
