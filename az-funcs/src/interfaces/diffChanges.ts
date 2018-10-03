export interface DiffChanges {
  entities: DiffEntity[]
  functions: DiffFunction[]
}

export interface DiffEntity {
  changeType: ChangeType,
  name?: string,
  properties?: {
    changeType: ChangeType,
    name: string,
    typeName: string
  }[],
  functionIds?: {
    changeType: ChangeType,
    name: string,
    typeName: string
  }[],
  navigationProperties?: {
    changeType: ChangeType,
    name: string,
    typeName: string
  }[]
}

export interface DiffFunction {
  changeType: ChangeType,
  name?: string,
  returnType?: string
}

export enum ChangeType {
  Add = 0,
  Update = 1,
  Delete = 2,
  NoChange = 3
}
