import { Expression, EvaluationResult } from '../common/types';
import { DomainObject } from '../engine/DomainObject';

export class Predicate implements Expression {
    constructor(public readonly name: string) {}

    evaluate(object: DomainObject): EvaluationResult {
        const rawValue = object.getRawPredicateState(this.name);
        const value = rawValue === undefined ? false : rawValue;

        const explanation: string[] = [];
        explanation.push(`Fact '${this.name}' is ${value ? "TRUE" : "FALSE"} for object '${object.name}'`);

        if (rawValue === undefined) {
            explanation.push(`\n[Heuristic: Closed-World Assumption]`);
            explanation.push(`The fact was not explicitly set to TRUE, so it is assumed to be FALSE. Classical logic might consider its truth value 'unknown'.`);
        }

        return new EvaluationResult(value, explanation); // CHANGED to pass the array
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