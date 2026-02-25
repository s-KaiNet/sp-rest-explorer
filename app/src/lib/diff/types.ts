// ── Diff output types (ported from az-funcs/src/interfaces/diffChanges.ts) ──

export type ChangeType = 'added' | 'updated' | 'removed'

export interface DiffPropertyChange {
  changeType: ChangeType
  name: string
  typeName: string
}

export interface DiffEntity {
  changeType: ChangeType
  name: string
  properties: DiffPropertyChange[]
  navigationProperties: DiffPropertyChange[]
  functions: DiffPropertyChange[]
}

export interface DiffFunction {
  changeType: ChangeType
  name: string
  returnType: string
}

export interface DiffChanges {
  entities: DiffEntity[]
  functions: DiffFunction[]
}

export type DiffStatus = 'idle' | 'loading' | 'ready' | 'error'
