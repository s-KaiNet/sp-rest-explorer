import {
  FunctionImport,
  EntityType,
  Metadata
} from '../../../parser/src/interfaces'

export class MetadataParser {
  constructor(private metadata: Metadata) {}

  public getObjectByPath(path: string): FunctionImport | EntityType {
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

    return nextObject
  }

  public buildUriTemplate(path: string): string {
    let objects = path.split('/').splice(2)
    let firstFunc = this.getFirstObject(path)
    let basePath = `${firstFunc.name}(...)/`

    if (objects.length === 1) {
      return basePath
    }

    objects = objects.splice(1)

    let nextObject: FunctionImport | EntityType = firstFunc

    for (const propertyName of objects) {
      nextObject = this.getObject(nextObject, propertyName)
      if (this.isFunctionImport(nextObject)) {
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

      for (const funcId of returnType.functions) {
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

      for (const funcId of currentObject.functions) {
        let func = this.metadata.functions[funcId]
        if (func.name === propertyName) {
          return func
        }
      }
    }
  }

}
