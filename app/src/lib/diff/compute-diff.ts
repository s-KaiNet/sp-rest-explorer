import { create } from 'jsondiffpatch'
import type { Metadata, FunctionImport } from '@/lib/metadata/types'

// ── jsondiffpatch instance with SP-specific config ──

const jsdiff = create({
  objectHash: (obj: object, index?: number) => {
    const record = obj as Record<string, unknown>
    return (
      (record.id as string) ||
      (record.name as string) ||
      (record._id as string) ||
      `$$index:${index}`
    )
  },
  propertyFilter: (name: string) => !name.startsWith('SP.Data.'),
})

// ── Public API ──

/**
 * Compute a raw jsondiffpatch delta between two Metadata snapshots.
 *
 * Returns `undefined` when both inputs are identical (no changes).
 * The delta is a nested object following jsondiffpatch's delta format:
 * @see https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md
 */
export function computeRawDiff(
  current: Metadata,
  previous: Metadata,
): object | undefined {
  const preparedCurrent = prepareForDiff(current)
  const preparedPrevious = prepareForDiff(previous)

  // jsondiffpatch.diff(left, right) — left is "previous", right is "current"
  // so adds = things in current not in previous
  return jsdiff.diff(preparedPrevious, preparedCurrent) as object | undefined
}

// ── Internal helpers ──

/**
 * Build a composite key for function matching across snapshots.
 * Format: `${parentObject}-${name}-${returnType}`
 *
 * Preserves exact legacy logic from az-funcs/src/diffGenerator.ts
 */
function getUniqueFunctionName(func: FunctionImport): string {
  const noThis = '_no_this_'
  const returnType = func.returnType ? func.returnType : '_no_return_'
  const name = func.name

  let parentObject: string
  if (func.isRoot) {
    parentObject = '_is_root_'
  } else {
    if (func.parameters.length === 0) {
      parentObject = noThis
    } else {
      const thisParam = func.parameters.find((p) => p.name === 'this')
      parentObject = thisParam ? thisParam.typeName : noThis
    }
  }

  return `${parentObject}-${name}-${returnType}`
}

/**
 * Prepare Metadata for diffing by re-keying functions to composite names
 * and replacing entity functionIds arrays with expanded function objects.
 *
 * Ported from the legacy `fixJson()` in az-funcs/src/diffGenerator.ts.
 */
function prepareForDiff(metadata: Metadata): Metadata {
  const copy = structuredClone(metadata)

  // Re-key functions by composite name instead of numeric id
  const newFuncs: Record<string, FunctionImport> = {}
  for (const funcId in copy.functions) {
    if (Object.hasOwn(copy.functions, funcId)) {
      const func = copy.functions[funcId as unknown as number]
      const uniqueName = getUniqueFunctionName(func)
      newFuncs[uniqueName] = func
      // Override id with composite key (for jsondiffpatch objectHash matching)
      ;(newFuncs[uniqueName] as unknown as Record<string, unknown>).id =
        uniqueName
    }
  }

  // Replace functions record with re-keyed version
  ;(copy as unknown as Record<string, unknown>).functions = newFuncs

  // Replace entity functionIds arrays with expanded function objects
  for (const name in metadata.entities) {
    if (Object.hasOwn(metadata.entities, name)) {
      const entity = metadata.entities[name]
      if (!entity.functionIds || entity.functionIds.length === 0) continue

      const newEntity = copy.entities[name]
      const expandedFunctions: FunctionImport[] = []

      for (const id of entity.functionIds) {
        const originalFunction = metadata.functions[id]
        const uniqueName = getUniqueFunctionName(originalFunction)
        expandedFunctions.push(
          newFuncs[uniqueName] as unknown as FunctionImport,
        )
      }

      ;(newEntity as unknown as Record<string, unknown>).functionIds =
        expandedFunctions
    }
  }

  return copy
}
