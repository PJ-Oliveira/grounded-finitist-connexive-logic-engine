import { Expression, EvaluationResult } from '../common/types';
import { DomainObject } from '../engine/DomainObject';

export class Not implements Expression {
    constructor(public readonly expression: Expression) {}

    evaluate(object: DomainObject): EvaluationResult {
        const innerResult = this.expression.evaluate(object);
        const finalValue = !innerResult.value;

        // Build the explanation as a proper array of strings
        const explanationLines: string[] = [];
        explanationLines.push(`NOT evaluates to ${finalValue} because its inner expression is ${innerResult.value}.`);
        explanationLines.push(`  - Inner Derivation...`);
        
        // Add the inner explanation, indented, to the array
        innerResult.explanationLines.forEach(line => {
            explanationLines.push(`    ${line}`);
        });

        // Return the result with the explanation as an array, respecting the new type
        return new EvaluationResult(finalValue, explanationLines);
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