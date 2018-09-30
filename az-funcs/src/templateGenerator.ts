import * as fs from 'fs'
import * as path from 'path'
import * as hbs from 'handlebars'

import { DiffChanges, ChangeType, DiffEntity } from './interfaces/diffChanges'

export class TemplateGenerator {

  private PropertiesKey = 'properties'
  private NavigationPropertiesKey = 'navigationProperties'
  private FunctionIdsKey = 'functionIds'

  public GenerateTemplate(diffJson: any, localPath: string): string {
    let hbsTemplate = fs.readFileSync(path.join(localPath, 'generator.hbs')).toString()
    let stylesTemplate = fs.readFileSync(path.join(localPath, 'styles.hbs')).toString()
    hbs.registerPartial('styles', hbs.compile(stylesTemplate))

    let template = hbs.compile(hbsTemplate)

    let diffChanges: DiffChanges = {
      entities: []
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

        if (entity instanceof Array) {                         // new entity was added
          entityChange.changeType = this.detectChangeType(entity)

          if (entityChange.changeType === ChangeType.Add) {
            entityChange.value = entity[0]
          }
        } else {                                               // properties inside entity were updated
          entityChange.changeType = ChangeType.NoChange

          this.populateChildProperties(entity, entityChange, this.PropertiesKey)
          this.populateChildProperties(entity, entityChange, this.NavigationPropertiesKey)
          this.populateChildProperties(entity, entityChange, this.FunctionIdsKey)

        }

        diffChanges.entities.push(entityChange)

      }
    }

    return template({
      changes: diffChanges
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
            name: propertyValue[0].name
          })
        }
      }
    }
  }

  private detectChangeType(node: any[]): ChangeType {
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
}
