import { Expression, EvaluationResult } from '../common/types';
import { DomainObject } from '../engine/DomainObject';

export class Or implements Expression {
    constructor(public readonly left: Expression, public readonly right: Expression) {}

    evaluate(object: DomainObject): EvaluationResult {
        const leftResult = this.left.evaluate(object);
        const rightResult = this.right.evaluate(object);
        const finalValue = leftResult.value || rightResult.value;
        const reason = `(${leftResult.value} OR ${rightResult.value}) -> ${finalValue}`;
        return new EvaluationResult(finalValue, [reason]); // Wrap in brackets []
    }

    getAtomicPredicates(): Set<string> {
        const combined = new Set(this.left.getAtomicPredicates());
        this.right.getAtomicPredicates().forEach(p => combined.add(p));
        return combined;
    }

    toTreeString(): string {
        return `(${this.left.toTreeString()} OR ${this.right.toTreeString()})`;
    }

    equals(other: Expression): boolean {
        return other instanceof Or && this.left.equals(other.left) && this.right.equals(other.right);
    }
}