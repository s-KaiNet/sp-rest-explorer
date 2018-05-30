import { Parser } from 'xml2js'
import * as fs from 'fs'
import { promisify } from 'bluebird'
import { Association } from './interfaces/association'
import { EntityType } from './interfaces/EntityType'
import { Metadata } from './interfaces/metadata'
import { FunctionImport } from './interfaces/functionImport'

export class MetadataParser {

  private associations: Map<string, Association>
  private entities: Map<string, EntityType>
  private functions: FunctionImport[]

  private aliases: { [key: string]: string } = {
    'Microsoft_Office_Server_Search_REST_SearchService': 'search',
    'Microsoft_AppServices_AppCollection': 'Apps',
    'SP_Publishing_SitePageService': 'sitepages',
    'SP_Social_SocialRestFollowingManager': 'social.following',
    'SP_Social_SocialRestFeedManager': 'social.feed'
  }

  constructor(private content: string) {
    this.associations = new Map()
    this.entities = new Map()
    this.functions = []
  }

  public async parseMetadata(): Promise<Metadata> {
    let parser = new Parser()
    let parseStringAsync = promisify<any, string>(parser.parseString)
    let obj = await parseStringAsync(this.content)
    let schemas = obj['edmx:Edmx']['edmx:DataServices'][0]['Schema']

    this.extractAssociations(schemas)
    this.extractTypesInfo(schemas)
    this.extractFunctionImports(schemas)

    let metadata: Metadata = {
      entities: {},
      functions: {}
    }

    this.entities.forEach((entity, key) => {
      metadata.entities[key] = entity
    })

    this.functions.forEach((func) => {
      metadata.functions[func.id] = func
    })

    // TODO - sort
    /*
    metadata.functions.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
        }
        if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
        }
        return 0;
    });
    */

    // dynamically adds all entities of type Collection(<type name>)
    this.populateWithCollectionObjects(metadata)

    // adds functions to all parsed entities
    this.populateEntitiesWithMethods(metadata)

    return metadata
  }

  private populateWithCollectionObjects(metadata: Metadata): void {
    for (const entityFullName in metadata.entities) {
      if (metadata.entities.hasOwnProperty(entityFullName)) {
        const entity = metadata.entities[entityFullName]
        entity.properties.forEach(prop => {
          this.ensureCollectionEntityType(prop.typeName, metadata.entities)
        })
        entity.navigationProperties.forEach(prop => {
          this.ensureCollectionEntityType(prop.typeName, metadata.entities)
        })
      }
    }

    for (const funcId in metadata.functions) {
      if (metadata.functions.hasOwnProperty(funcId)) {
        const func = metadata.functions[funcId]

        this.ensureCollectionEntityType(func.returnType, metadata.entities)
      }
    }
  }

  private ensureCollectionEntityType(typeName: string, entities: { [key: string]: EntityType }): void {
    if (typeName && typeName.indexOf('Collection') === 0 && !entities[typeName]) {
      entities[typeName] = {
        fullName: typeName,
        functionIds: [],
        name: typeName,
        properties: [],
        navigationProperties: []
      }
    }
  }

  private populateEntitiesWithMethods(metadata: Metadata): void {
    for (const funcId in metadata.functions) {
      if (metadata.functions.hasOwnProperty(funcId)) {
        const func = metadata.functions[funcId]
        let thisParam = this.getThisParameter(func)
        if (!thisParam) {
          continue
        }

        // special case for collections, because they are not separate nodes in $metadata
        this.ensureCollectionEntityType(thisParam, metadata.entities)

        let entity = metadata.entities[thisParam]
        entity.functionIds.push(func.id)
      }
    }
  }

  private getThisParameter(func: FunctionImport): string {
    let param = func.parameters.filter(f => f.name === 'this')[0]

    if (param) {
      return param.typeName
    }

    return null
  }

  private extractFunctionImports(schemas: any): void {
    for (const schema of schemas) {
      if (!schema.EntityContainer) {
        continue
      }

      for (const container of schema.EntityContainer) {
        if (!container.FunctionImport) {
          continue
        }

        this.extractFunctions(container.FunctionImport)
      }
    }
  }

  private extractFunctions(funcs: any): void {
    let i = 1
    for (const func of funcs) {
      let funcImport: FunctionImport = {
        isBindable: func.$.IsBindable ? func.$.IsBindable === 'true' : undefined,
        isComposable: func.$.IsComposable ? func.$.IsComposable === 'true' : undefined,
        name: func.$.Name,
        returnType: func.$.ReturnType,
        isRoot: true,
        parameters: [],
        id: i++
      }

      // exclude "Internal" APIs
      if (funcImport.name.indexOf('Internal') !== -1 || (funcImport.returnType && funcImport.returnType.indexOf('Internal') !== -1)) {
        continue
      }

      // TODO - reduces number of root functions - remove later on
      if (funcImport.name.indexOf('_') !== -1) {
        // continue
      }

      if (this.aliases[funcImport.name] && this.functions.filter(f => f.name === this.aliases[funcImport.name]).length === 0) {
        funcImport.name = this.aliases[funcImport.name]
      } else if (this.aliases[funcImport.name] && this.functions.filter(f => f.name === this.aliases[funcImport.name]).length > 0) {
        continue
      }

      if (func.Parameter) {
        for (const param of func.Parameter) {
          funcImport.parameters.push({
            name: param.$.Name,
            typeName: param.$.Type,
            nullable: func.$.Nullable ? func.$.Nullable === 'true' : undefined
          })

          // IsBindable == true means the same?
          if (param.$.Name === 'this') {
            funcImport.isRoot = false
          }
        }
      }

      // optimize size of json - leave only props with true values
      if (!funcImport.isRoot) {
        delete funcImport.isRoot
      }

      funcImport.name = funcImport.name.replace(/_/gi, '.')
      this.functions.push(funcImport)
    }
  }

  private extractTypesInfo(schemas: any): void {
    for (const schema of schemas) {
      let namespace = schema.$.Namespace
      if (namespace === 'SP.Data') {
        continue
      }
      if (schema.ComplexType) {
        this.extractComplexTypes(namespace, schema.ComplexType)
      }

      if (schema.EntityType) {
        this.extractEntityTypes(namespace, schema.EntityType)
      }
    }
  }

  private extractEntityTypes(namespace: string, entityTypes: any[]): void {
    for (const type of entityTypes) {
      let entityType = this.createEntityTypeWithProperties(namespace, type)

      if (type.NavigationProperty) {
        entityType.navigationProperties = []
        for (const navigationProperty of type.NavigationProperty) {
          let toRole = navigationProperty.$.ToRole
          let relationship = navigationProperty.$.Relationship
          let indx = relationship.lastIndexOf('.')
          let name = relationship.substring(indx + 1, relationship.length)
          let association = this.associations.get(name)

          entityType.navigationProperties.push({
            typeName: association.roles[toRole],
            name: navigationProperty.$.Name
          })
        }
      }
    }
  }

  private extractComplexTypes(namespace: string, complexTypes: any[]): void {
    for (const complexType of complexTypes) {
      let entityType = this.createEntityTypeWithProperties(namespace, complexType)
    }
  }

  private createEntityTypeWithProperties(namespace: string, metadataType: any): EntityType {
    let fullName = `${namespace}.${metadataType.$.Name}`
    let entityType: EntityType = {
      name: metadataType.$.Name,
      fullName: fullName,
      properties: [],
      functionIds: [],
      navigationProperties: []
    }
    if (metadataType.$.BaseType) {
      entityType.baseTypeName = metadataType.$.BaseType
    }

    if (metadataType.Property && metadataType.Property instanceof Array) {
      for (const property of metadataType.Property) {
        entityType.properties.push({
          name: property.$.Name,
          typeName: property.$.Type,
          nullable: property.$.Nullable ? property.$.Nullable === 'true' : undefined
        })
      }
    }

    this.entities.set(fullName, entityType)
    return entityType
  }

  private extractAssociations(schemas: any): void {
    for (const schema of schemas) {
      if (schema.Association) {
        for (const association of schema.Association) {
          let roles: any = {}
          let multiplicity = association['End'][0].$.Multiplicity
          if (multiplicity.indexOf('*') !== -1) {
            roles[association['End'][0].$.Role] = `Collection(${association['End'][0].$.Type})`
          } else {
            roles[association['End'][0].$.Role] = association['End'][0].$.Type
          }

          multiplicity = association['End'][1].$.Multiplicity
          if (multiplicity.indexOf('*') !== -1) {
            roles[association['End'][1].$.Role] = `Collection(${association['End'][1].$.Type})`
          } else {
            roles[association['End'][1].$.Role] = association['End'][1].$.Type
          }

          this.associations.set(association.$.Name, {
            name: association.$.Name,
            roles: roles
          })
        }
      }
    }
  }
}
