import { DomainObject } from '../engine/DomainObject';

// Represents the result of an evaluation, including the explanation.
export class EvaluationResult {
    constructor(
        public value: boolean,
        public explanation: string,
        // Optional fields for comparing with classical logic
        public isNonClassical: boolean = false,
        public classicalValue?: boolean
    ) {}
}

// Base interface for all logical expressions.
export interface Expression {
    evaluate(object: DomainObject): EvaluationResult;
    getAtomicPredicates(): Set<string>;
    toTreeString(): string;
    equals(other: Expression): boolean;
}