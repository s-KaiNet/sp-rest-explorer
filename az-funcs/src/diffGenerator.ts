import { Metadata, FunctionImport } from './interfaces'

const jsondiffpatch = require('jsondiffpatch')

export class DiffGenerator {
  public static GenerateDiff(latest: Metadata, previous: Metadata): any {
    let jsdiff = jsondiffpatch.create({
      objectHash: (obj: any, index: number) => {
          // try to find an id property, otherwise just use the index in the array
        return obj.id || obj.name || obj._id || '$$index:' + index
      },
      propertyFilter: function(name: string) {
        return !name.startsWith('SP.Data.')
      }
    })

    let latestFixed = this.fixJson(latest)
    let previousFixed = this.fixJson(previous)

    return jsdiff.diff(previousFixed, latestFixed)
  }

  private static fixJson(metadata: Metadata): Metadata {
    let copy = JSON.parse(JSON.stringify(metadata))

    let newFuncs: { [key: string]: FunctionImport } = {}
    for (const funcId in copy.functions) {
      if (copy.functions.hasOwnProperty(funcId)) {
        const func = copy.functions[funcId]
        const uniqueName = this.getUniqueFunctionName(func)
        newFuncs[uniqueName] = func
        newFuncs[uniqueName].id = uniqueName as any
      }
    }

    copy.functions = newFuncs

    for (const name in metadata.entities) {
      if (metadata.entities.hasOwnProperty(name)) {
        const entity = metadata.entities[name]
        if (!entity.functionIds || entity.functionIds.length === 0) continue

        let newEntity = copy.entities[name]
        newEntity.functionIds = []
        for (const id of entity.functionIds) {
          let originalFunction = metadata.functions[id]
          const uniqueName = this.getUniqueFunctionName(originalFunction)
          newEntity.functionIds.push(copy.functions[uniqueName])
        }
      }
    }

    return copy
  }

  private static getUniqueFunctionName(func: any): string {
    let noThis = '_no_this_'
    let returnType = func.returnType ? func.returnType : '_no_return_'
    let name = func.name
    let parentObject = ''
    if (func.isRoot) {
      parentObject = '_is_root_'
    } else {
      if (func.parameters.length === 0) {
        parentObject = noThis
      } else {
        let thisParam = func.parameters.filter((f: any) => f.name === 'this')[0]
        parentObject = thisParam ? thisParam.typeName : noThis
      }
    }

    return `${parentObject}-${name}-${returnType}`
  }

}
