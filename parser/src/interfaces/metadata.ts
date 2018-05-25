import { EntityType } from './EntityType';
import { FunctionImport } from './functionImport';

export interface Metadata {
    entities: { [key: string]: EntityType };
    functions: { [key: number]: FunctionImport };
}
