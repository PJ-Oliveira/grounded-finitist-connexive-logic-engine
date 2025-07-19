import { Expression, EvaluationResult } from '../common/types';
import { DomainObject } from '../engine/DomainObject';
import { Not } from './Not';

export class RelevantImplication implements Expression {
    constructor(public readonly antecedent: Expression, public readonly consequent: Expression) {}

    evaluate(object: DomainObject): EvaluationResult {
        const antecedentResult = this.antecedent.evaluate(object);
        const consequentResult = this.consequent.evaluate(object);

        const classicalTruth = !antecedentResult.value || consequentResult.value;
        const antecedentPredicates = this.antecedent.getAtomicPredicates();
        const consequentPredicates = this.consequent.getAtomicPredicates();

        // Relevance check
        const isRelevant = [...consequentPredicates].every(
            predicate => antecedentPredicates.has(predicate)
        );

        // Aristotle's Thesis check: is the structure NOT-P -> P?
        let isAristotleCoherent = true;
        if (this.antecedent instanceof Not) {
            const notAntecedent = this.antecedent as Not;
            if (notAntecedent.expression.equals(this.consequent)) {
                isAristotleCoherent = false;
            }
        }

        // Boethius's Thesis check: is it the case that (A -> C) and (A -> ~C)?
        const oppositeConsequentResult = new Not(this.consequent).evaluate(object);
        const oppositeClassicalTruth = !antecedentResult.value || oppositeConsequentResult.value;
        const isBoethiusViolation = classicalTruth && oppositeClassicalTruth;

        const finalValue = classicalTruth && isRelevant && isAristotleCoherent && !isBoethiusViolation;
        
        // Build the detailed explanation string with heuristics
        let reason = `Classical: ${classicalTruth}, Relevant: ${isRelevant}, Aristotle Coherent: ${isAristotleCoherent}, Boethius Coherent: ${!isBoethiusViolation} -> Final: ${finalValue}`;

        // HEURISTIC: Add explanations for failures.
        if (!isRelevant) {
            reason += `\n\n\x1b[36m[Heuristic: Relevance Logic]\x1b[0m Implication failed. The consequent cannot introduce new topics (predicates) that were not present in the antecedent.`;
        }
        if (!isAristotleCoherent) {
            reason += `\n\n\x1b[36m[Heuristic: Connexive Logic (Aristotle's Thesis)]\x1b[0m Implication failed. A proposition cannot be implied by its own negation (form: NOT P -> P).`;
        }
        if (isBoethiusViolation) {
             reason += `\n\n\x1b[36m[Heuristic: Connexive Logic (Boethius's Thesis)]\x1b[0m Implication failed. An antecedent cannot imply both a proposition and its negation (form: (A -> C) and (A -> NOT C)).`;
        }

        const isNonClassicalResult = finalValue !== classicalTruth;

        return new EvaluationResult(finalValue, reason, isNonClassicalResult, classicalTruth);
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