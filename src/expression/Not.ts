import { Expression, EvaluationResult } from '../common/types';
import { DomainObject } from '../engine/DomainObject';

export class Not implements Expression {
    constructor(public readonly expression: Expression) {}

    evaluate(object: DomainObject): EvaluationResult {
        const innerResult = this.expression.evaluate(object);
        const finalValue = !innerResult.value;
        const explanation = `Negation (NOT) is ${finalValue ? "TRUE" : "FALSE"} because the inner expression evaluated to ${innerResult.value ? "TRUE" : "FALSE"}.
  - Inner Eval: ${innerResult.explanation.replace(/\n/g, '\n  ')}`;
        return new EvaluationResult(finalValue, explanation);
    }

    getAtomicPredicates(): Set<string> {
        return this.expression.getAtomicPredicates();
    }

    toTreeString(): string {
        return `(NOT ${this.expression.toTreeString()})`;
    }

    equals(other: Expression): boolean {
        return other instanceof Not && this.expression.equals(other.expression);
    }
}