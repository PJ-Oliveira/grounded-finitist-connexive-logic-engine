import { Expression, EvaluationResult } from '../common/types';
import { DomainObject } from '../engine/DomainObject';

export class Predicate implements Expression {
    constructor(public readonly name: string) {}

    evaluate(object: DomainObject): EvaluationResult {
        const rawValue = object.getRawPredicateState(this.name);
        const value = rawValue === undefined ? false : rawValue;

        let explanation = `Fact '${this.name}' is ${value ? "TRUE" : "FALSE"} for object '${object.name}'`;

        // HEURISTIC: Add explanation for the Closed-World Assumption.
        if (rawValue === undefined) {
            explanation += `\n\n\x1b[36m[Heuristic: Closed-World Assumption]\x1b[0m The fact was not explicitly set to TRUE, so it is assumed to be FALSE. Classical logic might consider its truth value 'unknown'.`;
        }

        return new EvaluationResult(value, explanation);
    }

    getAtomicPredicates(): Set<string> {
        return new Set([this.name]);
    }

    toTreeString(): string {
        return `"${this.name}"`;
    }

    equals(other: Expression): boolean {
        return other instanceof Predicate && this.name === other.name;
    }
}