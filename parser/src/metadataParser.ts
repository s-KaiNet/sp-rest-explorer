import { Parser } from 'xml2js';
import * as fs from 'fs';
import { promisify } from 'bluebird';
import { Association } from './interfaces/association';
import { EntityType } from './interfaces/EntityType';
import { Metadata } from './interfaces/metadata';
import { FunctionImport } from './interfaces/functionImport';

export class MetadataParser {

    private associations: Map<string, Association>;
    private entities: Map<string, EntityType>;
    private functions: FunctionImport[];

    constructor(private content: string) {
        this.associations = new Map();
        this.entities = new Map();
        this.functions = [];
    }

    public async parseMetadata(): Promise<Metadata> {
        let parser = new Parser();
        let parseStringAsync = promisify<any, string>(parser.parseString);
        let obj = await parseStringAsync(this.content);
        let schemas = obj['edmx:Edmx']['edmx:DataServices'][0]['Schema'];

        this.extractAssociations(schemas);
        this.extractTypesInfo(schemas);
        this.extractFunctionImports(schemas);

        let metadata: Metadata = {
            entities: {},
            functions: this.functions
        };

        this.entities.forEach((entity, key) => {
            metadata.entities[key] = entity;
        });

        return metadata;
    }

    private extractFunctionImports(schemas: any): void {
        for (const schema of schemas) {
            if (!schema.EntityContainer) {
                continue;
            }

            for (const container of schema.EntityContainer) {
                if (!container.FunctionImport) {
                    continue;
                }

                this.extractFunctions(container.FunctionImport);
            }
        }
    }

    private extractFunctions(funcs: any): void {
        for (const func of funcs) {
            let funcImport: FunctionImport = {
                isBindable: func.$.IsBindable ? func.$.IsBindable === 'true' : undefined,
                isComposable: func.$.IsComposable ? func.$.IsComposable === 'true' : undefined,
                name: func.$.Name,
                returnType: func.$.ReturnType,
                isRoot: true
            };

            if (func.Parameter) {
                funcImport.parameters = [];
                for (const param of func.Parameter) {
                    funcImport.parameters.push({
                        name: param.$.Name,
                        typeName: param.$.Type,
                        nullable: func.$.Nullable ? func.$.Nullable === 'true' : undefined
                    });

                    // IsBindable == true means the same?
                    if (param.$.Name === 'this') {
                        funcImport.isRoot = false;
                    }
                }
            }

            this.functions.push(funcImport);
        }
    }

    private extractTypesInfo(schemas: any): void {
        for (const schema of schemas) {
            let namespace = schema.$.Namespace;
            if (namespace === 'SP.Data') {
                continue;
            }
            if (schema.ComplexType) {
                this.extractComplexTypes(namespace, schema.ComplexType);
            }

            if (schema.EntityType) {
                this.extractEntityTypes(namespace, schema.EntityType);
            }
        }
    }

    private extractEntityTypes(namespace: string, entityTypes: any[]): void {
        for (const type of entityTypes) {
            let entityType = this.createEntityTypeWithProperties(namespace, type);

            if (type.NavigationProperty) {
                entityType.navigationProperties = [];
                for (const navigationProperty of type.NavigationProperty) {
                    let toRole = navigationProperty.$.ToRole;
                    let relationship = navigationProperty.$.Relationship;
                    let indx = relationship.lastIndexOf('.');
                    let name = relationship.substring(indx + 1, relationship.length);
                    let association = this.associations.get(name);
                    entityType.navigationProperties.push({
                        typeName: association.roles[toRole]
                    });
                }
            }
        }
    }

    private extractComplexTypes(namespace: string, complexTypes: any[]): void {
        for (const complexType of complexTypes) {
            let entityType = this.createEntityTypeWithProperties(namespace, complexType);
        }
    }

    private createEntityTypeWithProperties(namespace: string, metadataType: any): EntityType {
        let fullName = `${namespace}.${metadataType.$.Name}`;
        let entityType: EntityType = {
            name: metadataType.$.Name,
            fullName: fullName,
            properties: []
        };
        if (metadataType.$.BaseType) {
            entityType.baseTypeName = metadataType.$.BaseType;
        }

        if (metadataType.Property && metadataType.Property instanceof Array) {
            for (const property of metadataType.Property) {
                entityType.properties.push({
                    name: property.$.Name,
                    typeName: property.$.Type,
                    nullable: property.$.Nullable ? property.$.Nullable === 'true' : undefined
                });
            }
        }

        this.entities.set(fullName, entityType);
        return entityType;
    }

    private extractAssociations(schemas: any): void {
        for (const schema of schemas) {
            if (schema.Association) {
                for (const association of schema.Association) {
                    let roles: any = {};
                    roles[association['End'][0].$.Role] = association['End'][0].$.Type;
                    roles[association['End'][1].$.Role] = association['End'][1].$.Type;

                    this.associations.set(association.$.Name, {
                        name: association.$.Name,
                        roles: roles
                    });
                }
            }
        }
    }
}
