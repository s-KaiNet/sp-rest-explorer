import { EntityType, FunctionImport } from './../../../az-funcs/src/interfaces'

export interface Entity extends EntityType {
  functions: FunctionImport[]
}
