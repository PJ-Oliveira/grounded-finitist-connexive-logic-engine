// src/expression/RelevantImplication.ts

import { Expression, EvaluationResult } from '../common/types';
import { DomainObject } from '../engine/DomainObject';
import { Not } from './Not';

/**
 * Represents a non-classical implication that is both Relevant and Connexive.
 * It is stricter than classical material implication (P -> Q).
 */
export class RelevantImplication implements Expression {
    constructor(public readonly antecedent: Expression, public readonly consequent: Expression) {}

    /**
     * Evaluates the implication based on four conditions:
     * 1. Classical Truth: The standard material implication (!A || C) must hold.
     * 2. Relevance: The consequent cannot introduce new atomic predicates not found in the antecedent.
     * 3. Aristotle's Thesis (Connexive): An expression of the form (NOT P -> P) is incoherent and FALSE.
     * 4. Boethius's Thesis (Connexive): An antecedent cannot imply both a proposition and its negation.
     */
    evaluate(object: DomainObject): EvaluationResult {
        const antecedentResult = this.antecedent.evaluate(object);
        const consequentResult = this.consequent.evaluate(object);

        const classicalTruth = !antecedentResult.value || consequentResult.value;
        
        const antecedentPredicates = this.antecedent.getAtomicPredicates();
        const consequentPredicates = this.consequent.getAtomicPredicates();
        const isRelevant = [...consequentPredicates].every(
            predicate => antecedentPredicates.has(predicate)
        );

        let isAristotleCoherent = true;
        if (this.antecedent instanceof Not) {
            if ((this.antecedent as Not).expression.equals(this.consequent)) {
                isAristotleCoherent = false;
            }
        }

        const oppositeConsequentResult = new Not(this.consequent).evaluate(object);
        const oppositeClassicalTruth = !antecedentResult.value || oppositeConsequentResult.value;
        const isBoethiusViolation = classicalTruth && oppositeClassicalTruth;

        const finalValue = classicalTruth && isRelevant && isAristotleCoherent && !isBoethiusViolation;
        const isNonClassicalResult = finalValue !== classicalTruth;
        
        // --- NEW FORMATTING LOGIC ---
        const explanationLines: string[] = [];
        explanationLines.push(`Classical: ${classicalTruth}, Relevant: ${isRelevant}, Aristotle Coherent: ${isAristotleCoherent}, Boethius Coherent: ${!isBoethiusViolation} -> Final: ${finalValue}`);

        if (!isRelevant) {
            explanationLines.push(`\n[Heuristic: Relevance Logic]`);
            explanationLines.push(`Implication failed. The consequent cannot introduce new topics (predicates) that were not present in the antecedent.`);
        }
        if (!isAristotleCoherent) {
            explanationLines.push(`\n[Heuristic: Connexive Logic (Aristotle's Thesis)]`);
            explanationLines.push(`Implication failed. A proposition cannot be implied by its own negation (form: NOT P -> P).`);
        }
        if (isBoethiusViolation) {
             explanationLines.push(`\n[Heuristic: Connexive Logic (Boethius's Thesis)]`);
             explanationLines.push(`Implication failed. An antecedent cannot imply both a proposition and its negation (form: (A -> C) and (A -> NOT C)).`);
        }

        return new EvaluationResult(finalValue, explanationLines, isNonClassicalResult, classicalTruth);
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