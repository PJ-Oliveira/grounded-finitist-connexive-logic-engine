import { Expression, EvaluationResult } from '../common/types';
import { DomainObject } from '../engine/DomainObject';

export class Predicate implements Expression {
    constructor(public readonly name: string) {}

    evaluate(object: DomainObject): EvaluationResult {
        const value = object.checkPredicate(this.name);
        const explanation = `Fact '${this.name}' is ${value ? "TRUE" : "FALSE"} for object '${object.name}'`;
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