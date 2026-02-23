/**
 * Metadata type definitions for the SharePoint REST API Explorer pipeline.
 *
 * Ported from legacy az-funcs/src/interfaces/ with tightened types:
 * - Added `readonly` to non-mutated fields
 * - Changed Parameter.nullable to optional (matches runtime behavior)
 * - Changed FunctionImport boolean flags to optional (parser deletes when false)
 * - Used Readonly<Record<>> for Association.roles
 */

/** A single property on an entity type. */
export interface Property {
  readonly name: string;
  readonly typeName: string;
  readonly nullable?: boolean;
}

/** A navigation property linking one entity type to another. */
export interface NavigationProperty {
  readonly typeName: string;
  readonly name: string;
}

/** A parameter on a function import. */
export interface Parameter {
  readonly name: string;
  readonly typeName: string;
  readonly nullable?: boolean;
}

/** An OData association between entity types. */
export interface Association {
  readonly name: string;
  readonly roles: Readonly<Record<string, string>>;
}

/**
 * A SharePoint entity type with its properties, navigation properties,
 * and references to bound function imports.
 *
 * Note: `properties`, `navigationProperties`, and `functionIds` are mutable
 * arrays because the parser pushes items during construction.
 */
export interface EntityType {
  readonly name: string;
  readonly fullName: string;
  readonly alias?: string;
  readonly baseTypeName?: string;
  properties: Property[];
  functionIds: number[];
  navigationProperties: NavigationProperty[];
}

/**
 * A SharePoint function import (action or function).
 *
 * Note: `isRoot`, `isComposable`, and `isBindable` are optional because
 * the parser deletes them when false/undefined to optimise JSON size.
 */
export interface FunctionImport {
  readonly name: string;
  isRoot?: boolean;
  isComposable?: boolean;
  isBindable?: boolean;
  readonly returnType: string;
  parameters: Parameter[];
  readonly id: number;
}

/** Top-level metadata container with entities keyed by fullName and functions keyed by numeric id. */
export interface Metadata {
  entities: Record<string, EntityType>;
  functions: Record<number, FunctionImport>;
}
