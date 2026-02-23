import { parseStringPromise } from 'xml2js';
import type {
  Association,
  EntityType,
  FunctionImport,
  Metadata,
  NavigationProperty,
  Parameter,
  Property,
} from './interfaces.js';

/** Alias map — exact same 6 entries as legacy (metadataParser.ts:14-21). */
const ALIASES: Readonly<Record<string, string>> = {
  'Microsoft_Office_Server_Search_REST_SearchService': 'search',
  'Microsoft_AppServices_AppCollection': 'Apps',
  'SP_Publishing_SitePageService': 'sitepages',
  'SP_Social_SocialRestFollowingManager': 'social.following',
  'SP_Social_SocialRestFeedManager': 'social.feed',
  'SP_MicroService_MicroServiceManager': 'microservicemanager',
};

/**
 * Parses SharePoint `_api/$metadata` XML and returns a Metadata object
 * byte-identical to the legacy MetadataParser output.
 */
export async function parseMetadata(xml: string): Promise<Metadata> {
  const obj = await parseStringPromise(xml);
  const schemas = obj['edmx:Edmx']['edmx:DataServices'][0]['Schema'];

  const associations = new Map<string, Association>();
  const entities = new Map<string, EntityType>();
  const functions: FunctionImport[] = [];

  // Step 1: Extract associations
  extractAssociations(schemas, associations);

  // Step 2: Extract types (ComplexType + EntityType)
  extractTypesInfo(schemas, entities, associations);

  // Step 3: Extract function imports
  extractFunctionImports(schemas, functions);

  // Step 4: Build metadata object (convert Maps to plain objects)
  const metadata: Metadata = {
    entities: {},
    functions: {},
  };

  entities.forEach((entity, key) => {
    metadata.entities[key] = entity;
  });

  functions.forEach((func) => {
    metadata.functions[func.id] = func;
  });

  // Step 5: Create synthetic Collection() entity types
  populateWithCollectionObjects(metadata);

  // Step 6: Link functions to entities via functionIds
  populateEntitiesWithMethods(metadata);

  return metadata;
}

// ---------------------------------------------------------------------------
// Association extraction
// ---------------------------------------------------------------------------

function extractAssociations(
  schemas: any[],
  associations: Map<string, Association>,
): void {
  for (const schema of schemas) {
    if (schema.Association) {
      for (const association of schema.Association) {
        const roles: Record<string, string> = {};

        let multiplicity = association['End'][0].$.Multiplicity;
        if (multiplicity.indexOf('*') !== -1) {
          roles[association['End'][0].$.Role] = `Collection(${association['End'][0].$.Type})`;
        } else {
          roles[association['End'][0].$.Role] = association['End'][0].$.Type;
        }

        multiplicity = association['End'][1].$.Multiplicity;
        if (multiplicity.indexOf('*') !== -1) {
          roles[association['End'][1].$.Role] = `Collection(${association['End'][1].$.Type})`;
        } else {
          roles[association['End'][1].$.Role] = association['End'][1].$.Type;
        }

        associations.set(association.$.Name, {
          name: association.$.Name,
          roles: roles,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Type extraction (EntityType + ComplexType)
// ---------------------------------------------------------------------------

function extractTypesInfo(
  schemas: any[],
  entities: Map<string, EntityType>,
  associations: Map<string, Association>,
): void {
  for (const schema of schemas) {
    const namespace: string = schema.$.Namespace;

    if (schema.ComplexType) {
      extractComplexTypes(namespace, schema.ComplexType, entities);
    }

    if (schema.EntityType) {
      extractEntityTypes(namespace, schema.EntityType, entities, associations);
    }
  }
}

function extractEntityTypes(
  namespace: string,
  entityTypes: any[],
  entities: Map<string, EntityType>,
  associations: Map<string, Association>,
): void {
  for (const type of entityTypes) {
    const entityType = createEntityTypeWithProperties(namespace, type, entities);

    if (type.NavigationProperty) {
      entityType.navigationProperties = [];
      for (const navigationProperty of type.NavigationProperty) {
        const toRole: string = navigationProperty.$.ToRole;
        const relationship: string = navigationProperty.$.Relationship;
        const indx = relationship.lastIndexOf('.');
        const name = relationship.substring(indx + 1, relationship.length);
        const association = associations.get(name)!;

        entityType.navigationProperties.push({
          typeName: association.roles[toRole],
          name: navigationProperty.$.Name,
        });
      }
    }
  }
}

function extractComplexTypes(
  namespace: string,
  complexTypes: any[],
  entities: Map<string, EntityType>,
): void {
  for (const complexType of complexTypes) {
    createEntityTypeWithProperties(namespace, complexType, entities);
  }
}

function createEntityTypeWithProperties(
  namespace: string,
  metadataType: any,
  entities: Map<string, EntityType>,
): EntityType {
  const fullName = `${namespace}.${metadataType.$.Name}`;
  const entityType: EntityType = {
    name: metadataType.$.Name,
    fullName: fullName,
    properties: [],
    functionIds: [],
    navigationProperties: [],
  };

  if (metadataType.$.BaseType) {
    (entityType as { baseTypeName?: string }).baseTypeName = metadataType.$.BaseType;
  }

  if (metadataType.Property && metadataType.Property instanceof Array) {
    for (const property of metadataType.Property) {
      const prop: Property = {
        name: property.$.Name,
        typeName: property.$.Type,
        nullable: property.$.Nullable ? property.$.Nullable === 'true' : undefined,
      };
      entityType.properties.push(prop);
    }
  }

  entities.set(fullName, entityType);
  return entityType;
}

// ---------------------------------------------------------------------------
// Function import extraction
// ---------------------------------------------------------------------------

function extractFunctionImports(
  schemas: any[],
  functions: FunctionImport[],
): void {
  for (const schema of schemas) {
    if (!schema.EntityContainer) {
      continue;
    }

    for (const container of schema.EntityContainer) {
      if (!container.FunctionImport) {
        continue;
      }

      extractFunctions(container.FunctionImport, functions);
    }
  }
}

function extractFunctions(
  funcs: any[],
  functions: FunctionImport[],
): void {
  let i = 1;

  for (const func of funcs) {
    // Create FunctionImport — id: i++ consumes an ID BEFORE any filtering.
    // This means Internal functions consume IDs but are excluded from output,
    // creating gaps in the ID sequence. This matches legacy behavior exactly.
    const funcImport: FunctionImport = {
      isBindable: func.$.IsBindable ? func.$.IsBindable === 'true' : undefined,
      isComposable: func.$.IsComposable ? func.$.IsComposable === 'true' : undefined,
      name: func.$.Name,
      returnType: func.$.ReturnType,
      isRoot: true,
      parameters: [],
      id: i++,
    };

    // Exclude "Internal" APIs (after ID assignment)
    if (
      funcImport.name.indexOf('Internal') !== -1 ||
      (funcImport.returnType && funcImport.returnType.indexOf('Internal') !== -1)
    ) {
      continue;
    }

    // Legacy dead code (commented-out underscore continue) — intentionally NOT ported
    // if (funcImport.name.indexOf('_') !== -1) { continue }

    // Alias dedup two-branch logic:
    // Branch 1: alias exists AND no function already has that alias → rename
    // Branch 2: alias exists AND a function already has that alias → skip entirely
    if (
      ALIASES[funcImport.name] &&
      functions.filter(f => f.name === ALIASES[funcImport.name]).length === 0
    ) {
      (funcImport as { name: string }).name = ALIASES[funcImport.name];
    } else if (
      ALIASES[funcImport.name] &&
      functions.filter(f => f.name === ALIASES[funcImport.name]).length > 0
    ) {
      continue;
    }

    // Extract parameters
    if (func.Parameter) {
      for (const param of func.Parameter) {
        (funcImport.parameters as Parameter[]).push({
          name: param.$.Name,
          typeName: param.$.Type,
          // NOTE: Uses FUNCTION-level $.Nullable, NOT parameter-level.
          // This is legacy behavior that must be replicated exactly.
          nullable: func.$.Nullable ? func.$.Nullable === 'true' : undefined,
        });

        if (param.$.Name === 'this') {
          funcImport.isRoot = false;
        }
      }
    }

    // Optimize JSON size — delete isRoot when false (legacy pattern)
    if (!funcImport.isRoot) {
      delete funcImport.isRoot;
    }

    // Underscore-to-dot replacement AFTER alias resolution
    (funcImport as { name: string }).name = funcImport.name.replace(/_/gi, '.');

    functions.push(funcImport);
  }
}

// ---------------------------------------------------------------------------
// Post-processing: Collection objects and entity-function linking
// ---------------------------------------------------------------------------

function ensureCollectionEntityType(
  typeName: string,
  entities: Record<string, EntityType>,
): void {
  if (typeName && typeName.indexOf('Collection') === 0 && !entities[typeName]) {
    entities[typeName] = {
      fullName: typeName,
      functionIds: [],
      name: typeName,
      properties: [],
      navigationProperties: [],
    };
  }
}

function populateWithCollectionObjects(metadata: Metadata): void {
  for (const entityFullName in metadata.entities) {
    if (metadata.entities.hasOwnProperty(entityFullName)) {
      const entity = metadata.entities[entityFullName];
      entity.properties.forEach(prop => {
        ensureCollectionEntityType(prop.typeName, metadata.entities);
      });
      entity.navigationProperties.forEach(prop => {
        ensureCollectionEntityType(prop.typeName, metadata.entities);
      });
    }
  }

  for (const funcId in metadata.functions) {
    if (metadata.functions.hasOwnProperty(funcId)) {
      const func = metadata.functions[funcId];
      ensureCollectionEntityType(func.returnType, metadata.entities);
    }
  }
}

function getThisParameter(func: FunctionImport): string | null {
  const param = func.parameters.filter(f => f.name === 'this')[0];
  if (param) {
    return param.typeName;
  }
  return null;
}

function populateEntitiesWithMethods(metadata: Metadata): void {
  for (const funcId in metadata.functions) {
    if (metadata.functions.hasOwnProperty(funcId)) {
      const func = metadata.functions[funcId];
      const thisParam = getThisParameter(func);
      if (!thisParam) {
        continue;
      }

      // Special case for collections
      ensureCollectionEntityType(thisParam, metadata.entities);

      const entity = metadata.entities[thisParam];
      entity.functionIds.push(func.id);
    }
  }
}
