// src/common/types.ts

import { DomainObject } from '../engine/DomainObject';

/**
 * Represents the result of an expression's evaluation.
 * This object carries the final boolean value, a string-based explanation
 * of the derivation, and metadata for comparing against classical logic.
 */
export class EvaluationResult {
    constructor(
        public value: boolean,
        public explanation: string,
        // Optional fields for comparing with classical logic
        public isNonClassical: boolean = false,
        public classicalValue?: boolean 
    ) {}
}

/**
 * The base interface for all logical expressions (Predicates, And, Or, etc.).
 * Every expression must be able to be evaluated, provide its atomic components,
 * and represent itself as a string.
 */
export interface Expression {
    /** Evaluates the expression against a specific object in the domain. */
    evaluate(object: DomainObject): EvaluationResult;

    /** Returns a set of all unique atomic predicate names within the expression. */
    getAtomicPredicates(): Set<string>;

    /** Returns a string representation of the expression tree. */
    toTreeString(): string;

    /** Compares this expression to another for structural equality. */
    equals(other: Expression): boolean;
}