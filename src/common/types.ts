import { DomainObject } from '../engine/DomainObject';

// Represents the result of an evaluation, including the explanation.
export class EvaluationResult {
    constructor(public value: boolean, public explanation: string) {}
}

// Base interface for all logical expressions.
export interface Expression {
    evaluate(object: DomainObject): EvaluationResult;
    getAtomicPredicates(): Set<string>;
    toTreeString(): string;
    equals(other: Expression): boolean;
}