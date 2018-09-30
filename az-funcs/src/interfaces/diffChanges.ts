import { Property } from './property'
import { NavigationProperty } from './navigationProperty'
import { EntityType } from './entityType'

export interface DiffChanges {
  entities: DiffEntity[]
}

export interface DiffEntity {
  changeType: ChangeType,
  name?: string,
  value?: EntityType,
  properties?: {
    changeType: ChangeType,
    name: string
  }[],
  functionIds?: {
    changeType: ChangeType,
    name: string
  }[],
  navigationProperties?: {
    changeType: ChangeType,
    name: string
  }[]
}

export enum ChangeType {
  Add = 0,
  Update = 1,
  Delete = 2,
  NoChange = 3
}
