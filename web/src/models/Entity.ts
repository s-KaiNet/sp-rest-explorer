import { EntityType, FunctionImport } from './../../../parser/src/interfaces'

export interface Entity extends EntityType {
  functions: FunctionImport[]
}
