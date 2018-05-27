import {
  FunctionImport,
  EntityType,
  Metadata
} from '../../../parser/src/interfaces'
import { Entity } from '../models/Entity'
import { ObjectHelper } from './objectHelper'

export class MetadataParser {
  constructor(private metadata: Metadata) {}

  public getObjectByPath(path: string): FunctionImport | Entity {
    let objects = path.split('/').splice(2)
    let firstFunc = this.getFirstObject(path)

    if (objects.length === 1) {
      return firstFunc
    }

    objects = objects.splice(1)

    let nextObject: FunctionImport | EntityType = firstFunc
    for (const propertyName of objects) {
      nextObject = this.getObject(nextObject, propertyName)
    }
    if (!this.isFunctionImport(nextObject)) {
      (nextObject as any).functions = this.getFunctions(nextObject.functionIds)
    }
    return ObjectHelper.clone(nextObject) as FunctionImport | Entity
  }

  public buildUriTemplate(path: string): string {
    let objects = path.split('/').splice(2)
    let firstFunc = this.getFirstObject(path)
    let basePath = ''

    if (firstFunc.parameters && firstFunc.parameters.length > 0) {
      basePath += `${firstFunc.name}(...)/`
    } else {
      basePath += `${firstFunc.name}/`
    }

    if (objects.length === 1) {
      return basePath
    }

    objects = objects.splice(1)

    let nextObject: FunctionImport | EntityType = firstFunc

    for (const propertyName of objects) {
      nextObject = this.getObject(nextObject, propertyName)
      if (
        this.isFunctionImport(nextObject) &&
        nextObject.parameters &&
        nextObject.parameters.length > 0
      ) {
        basePath += `${propertyName}(...)/`
      } else {
        basePath += `${propertyName}/`
      }
    }

    return basePath
  }

  public isFunctionImport(T: FunctionImport | EntityType): T is FunctionImport {
    return (T as FunctionImport).id != null
  }

  public getFunctions(ids: number[]): FunctionImport[] {
    if (!ids) {
      return []
    }
    let results: FunctionImport[] = []
    for (const id of ids) {
      results.push(this.metadata.functions[id])
    }

    return results
  }

  private getFirstObject(path: string): FunctionImport {
    let objects = path.split('/').splice(2)
    let firstFuncName = objects[0]
    let firstFunc: FunctionImport = null

    for (const funcName in this.metadata.functions) {
      if (this.metadata.functions.hasOwnProperty(funcName)) {
        const func = this.metadata.functions[funcName]
        if (func.isRoot && func.name === firstFuncName) {
          firstFunc = func
          break
        }
      }
    }

    return firstFunc
  }

  private getObject(
    currentObject: FunctionImport | EntityType,
    propertyName: string
  ): FunctionImport | EntityType {
    if (this.isFunctionImport(currentObject)) {
      let returnType = this.metadata.entities[currentObject.returnType]
      if (returnType.navigationProperties) {
        for (const prop of returnType.navigationProperties) {
          if (prop.name === propertyName) {
            return this.metadata.entities[prop.typeName]
          }
        }
      }

      for (const funcId of returnType.functionIds) {
        let func = this.metadata.functions[funcId]
        if (func.name === propertyName) {
          return func
        }
      }
    } else {
      if (currentObject.navigationProperties) {
        for (const prop of currentObject.navigationProperties) {
          if (prop.name === propertyName) {
            return this.metadata.entities[prop.typeName]
          }
        }
      }

      for (const funcId of currentObject.functionIds) {
        let func = this.metadata.functions[funcId]
        if (func.name === propertyName) {
          return func
        }
      }
    }
  }
}
