import { Parameter } from './parameter';

export interface FunctionImport {
    name: string;
    isRoot: boolean;
    isComposable: boolean;
    isBindable: boolean;
    returnType: string;
    parameters: Parameter[];
    id: number;
}
