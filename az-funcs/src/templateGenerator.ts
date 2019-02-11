import * as fs from 'fs'
import * as path from 'path'
import * as hbs from 'handlebars'

import { DiffChanges, ChangeType, DiffEntity, DiffFunction } from './interfaces/diffChanges'
import { DiffResult } from './interfaces/diffResult'
import { Utils } from './utils'

export class TemplateGenerator {

  private PropertiesKey = 'properties'
  private NavigationPropertiesKey = 'navigationProperties'
  private FunctionIdsKey = 'functionIds'

  public GenerateTemplate(diffJson: any, localPath: string): DiffResult {

    let hbsTemplate = fs.readFileSync(path.join(localPath, 'generator.hbs')).toString()
    let stylesTemplate = fs.readFileSync(path.join(localPath, 'styles.hbs')).toString()
    hbs.registerPartial('styles', hbs.compile(stylesTemplate))

    let template = hbs.compile(hbsTemplate)
    this.registerHelpers()

    let diffChanges: DiffChanges = {
      entities: [],
      functions: []
    }

    for (const name in diffJson.entities) {
      if (diffJson.entities.hasOwnProperty(name)) {
        const entity = diffJson.entities[name]

        let entityChange: DiffEntity = {
          properties: [],
          navigationProperties: [],
          functionIds: [],
          changeType: undefined,
          name: name
        }

        if (entity instanceof Array) {                         // entity was added or deleted
          entityChange.changeType = this.detectChangeType(entity)

          if (entityChange.changeType === ChangeType.Add) {
            let addedEntity = entity[0]
            this.copyAddedProperties('properties', addedEntity, entityChange)
            this.copyAddedProperties('navigationProperties', addedEntity, entityChange)
            this.copyAddedProperties('functionIds', addedEntity, entityChange)
          }
        } else {                                               // properties inside entity were updated
          entityChange.changeType = ChangeType.Update

          this.populateChildProperties(entity, entityChange, this.PropertiesKey)
          this.populateChildProperties(entity, entityChange, this.NavigationPropertiesKey)
          this.populateChildProperties(entity, entityChange, this.FunctionIdsKey)

        }

        diffChanges.entities.push(entityChange)
      }
    }

    for (const name in diffJson.functions) {
      if (!name.startsWith('_is_root_')) continue

      const func = diffJson.functions[name]

      if (!(func instanceof Array)) continue // do not detect changes in function properties, only detect add\delete
      let funcDiff: DiffFunction = {
        changeType: this.detectChangeType(func),
        name: func[0].name,
        returnType: func[0].returnType
      }

      diffChanges.functions.push(funcDiff)
    }

    diffChanges.entities = diffChanges.entities.sort((a: DiffEntity, b: DiffEntity) => {
      return a.name.localeCompare(b.name)
    })

    diffChanges.functions = diffChanges.functions.sort((a: DiffFunction, b: DiffFunction) => {
      return a.name.localeCompare(b.name)
    })

    let html = template({
      changes: diffChanges,
      requestId: Utils.makeid()
    })

    return {
      html: html,
      diffChanges: diffChanges
    }
  }

  private copyAddedProperties(propName: string, addedEntity: any, entityChange: DiffEntity): any {
    addedEntity[propName].forEach((prop: any) => {
      entityChange[propName].push({
        changeType: ChangeType.Add,
        name: prop.name,
        typeName: prop.typeName || prop.returnType
      })
    })
  }

  private populateChildProperties(entity: any, diffEntity: DiffEntity, propName: string): void {
    if (entity.hasOwnProperty(propName)
            && typeof entity[propName] === 'object'
            && entity[propName]['_t'] === 'a') {                // has property changes

      for (const indx in entity[propName]) {
        if (entity[propName].hasOwnProperty(indx) && indx !== '_t') {
          const propertyValue = entity[propName][indx]
          if (!(propertyValue instanceof Array)) continue    // if property type was changed, to not track it

          diffEntity[propName].push({
            changeType: this.detectChangeType(propertyValue),
            name: propertyValue[0].name,
            typeName: propertyValue[0].typeName || propertyValue[0].returnType
          })
        }
      }
    }
  }

  private detectChangeType(node: any[]): ChangeType {
    // https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md
    if (node.length === 1) {
      return ChangeType.Add
    }

    if (node.length === 3 && node[1] === 0 && node[2] === 0) {
      return ChangeType.Delete
    }

    if (node.length === 2) {
      return ChangeType.Update
    }

    throw new Error('Unsupported change type')
  }

  private registerHelpers(): void {
    hbs.registerHelper('changeColorClass', (changeType: ChangeType) => {
      switch (changeType) {
        case ChangeType.Add: return 'added'
        case ChangeType.Delete: return 'deleted'
        case ChangeType.Update: return 'updated'
        default:
          return ''
      }
    })

    hbs.registerHelper('greater-than', (a: number, b: number) => {
      return a > b
    })

    hbs.registerHelper('hasChanges', (entity: DiffEntity, options: hbs.HelperOptions) => {
      let fnTrue = options.fn
      let fnFalse = options.inverse

      if ((entity.properties && entity.properties.length > 0)
        || (entity.navigationProperties && entity.navigationProperties.length > 0)
        || (entity.functionIds && entity.functionIds.length > 0)) {
        return fnTrue(entity)
      }

      return fnFalse(entity)
    })
  }
}
