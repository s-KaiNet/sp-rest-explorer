import {
  FunctionImport,
  EntityType,
  Metadata,
  Property
} from '../../../azure-funcs/src/interfaces'
import { Entity } from '../models/Entity'
import { ObjectHelper } from './objectHelper'

export class MetadataParser {
  constructor(private metadata: Metadata) {}

  public getObjectByPath(path: string): FunctionImport | Entity {
    let objects = path.split('/')
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
    let objects = path.split('/')
    let firstFunc = this.getFirstObject(path)
    let basePath = this.getFuncTemplateString(firstFunc)

    if (objects.length === 1) {
      return basePath
    }

    objects = objects.splice(1)

    let nextObject: FunctionImport | EntityType = firstFunc

    for (const propertyName of objects) {
      nextObject = this.getObject(nextObject, propertyName)
      if (this.isFunctionImport(nextObject)) {
        basePath += this.getFuncTemplateString(nextObject)
      } else {
        basePath += `${propertyName}/`
      }
    }

    return basePath
  }

  public getFunction(entity: Entity, name: string): FunctionImport {
    for (const func of entity.functions) {
      if (func.name === name) {
        return func
      }
    }

    return null
  }

  public getEntity(fullName: string): Entity {
    let entity: Entity = {
      ...this.metadata.entities[fullName],
      functions: []
    }

    entity.functions = this.getFunctions(this.metadata.entities[fullName].functionIds)
    return entity
  }

  public getProperty(entity: Entity, prop: string): Property {
    for (const property of entity.properties) {
      if (property.name === prop) {
        return property
      }
    }

    return null
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

  private getFuncTemplateString(func: FunctionImport): string {
    if (this.hasParameters(func)) {
      return `${func.name}(...)/`
    }
    return `${func.name}/`
  }

  private hasParameters(func: FunctionImport): boolean {
    if (!func.parameters || func.parameters.length === 0) {
      return false
    }

    if (func.parameters.length === 1 && func.parameters[0].name === 'this') {
      return false
    }

    return true
  }

  private getFirstObject(path: string): FunctionImport {
    let objects = path.split('/')
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
