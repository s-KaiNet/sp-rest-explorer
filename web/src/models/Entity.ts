import { EntityType, FunctionImport } from './../../../azure-funcs/src/interfaces'

export interface Entity extends EntityType {
  functions: FunctionImport[]
}
