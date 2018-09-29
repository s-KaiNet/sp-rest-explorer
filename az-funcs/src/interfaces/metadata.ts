import { EntityType, FunctionImport } from './'

export interface Metadata {
  entities: { [key: string]: EntityType }
  functions: { [key: number]: FunctionImport }
}
