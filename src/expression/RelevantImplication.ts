import { Expression, EvaluationResult } from '../common/types';
import { DomainObject } from '../engine/DomainObject';
import { Not } from './Not';

export class RelevantImplication implements Expression {
    constructor(public readonly antecedent: Expression, public readonly consequent: Expression) {}

    evaluate(object: DomainObject): EvaluationResult {
        const antecedentResult = this.antecedent.evaluate(object);
        const consequentResult = this.consequent.evaluate(object);

        const classicalTruth = !antecedentResult.value || consequentResult.value;
        if (!classicalTruth) {
            const reason = `Failed classical implication check: !(antecedent:${antecedentResult.value}) || (consequent:${consequentResult.value})`;
            return new EvaluationResult(false, reason);
        }

        const antecedentPredicates = this.antecedent.getAtomicPredicates();
        const consequentPredicates = this.consequent.getAtomicPredicates();
        const intersection = new Set([...antecedentPredicates].filter(p => consequentPredicates.has(p)));
        const isRelevant = [...consequentPredicates].every(
            predicate => antecedentPredicates.has(predicate)
        );

        let isAristotleCoherent = true;
        if (this.antecedent instanceof Not) {
            const notAntecedent = this.antecedent as Not;
            if (notAntecedent.expression.equals(this.consequent)) {
                isAristotleCoherent = false;
            }
        }

        const oppositeClassicalTruth = !antecedentResult.value || !consequentResult.value;
        const isBoethiusViolation = classicalTruth && oppositeClassicalTruth;

        const finalValue = classicalTruth && isRelevant && isAristotleCoherent && !isBoethiusViolation;
        const reason = `Classical: ${classicalTruth}, Relevant: ${isRelevant}, Aristotle Coherent: ${isAristotleCoherent}, Boethius Coherent: ${!isBoethiusViolation} -> Final: ${finalValue}`;
        return new EvaluationResult(finalValue, reason);
    }

    getAtomicPredicates(): Set<string> {
        const combined = new Set(this.antecedent.getAtomicPredicates());
        this.consequent.getAtomicPredicates().forEach(p => combined.add(p));
        return combined;
    }

    toTreeString(): string {
        return `(${this.antecedent.toTreeString()} RELEVANTLY_IMPLIES ${this.consequent.toTreeString()})`;
    }

    equals(other: Expression): boolean {
        return other instanceof RelevantImplication && this.antecedent.equals(other.antecedent) && this.consequent.equals(other.consequent);
    }
}