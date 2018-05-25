import { Property } from './property';
import { NavigationProperty } from './navigationProperty';

export interface EntityType {
    name: string;
    fullName: string;
    alias?: string;
    baseTypeName?: string;
    properties: Property[];
    functions: number[];
    navigationProperties?: NavigationProperty[];
}
