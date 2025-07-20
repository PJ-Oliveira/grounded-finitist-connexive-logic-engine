// src/engine/Domain.ts

import { DomainObject } from './DomainObject';
import { Expression } from '../common/types';

/**
 * Represents the entire universe of discourse.
 * It contains a finite set of all known objects.
 */
export class Domain {
    private readonly objects = new Set<DomainObject>();

    addObject(obj: DomainObject): void {
        this.objects.add(obj);
    }

    getObject(name: string): DomainObject | undefined {
        for (const obj of this.objects) {
            if (obj.name.toLowerCase() === name.toLowerCase()) {
                return obj;
            }
        }
        return undefined;
    }

    /**
     * Evaluates if an expression holds true for all objects in the domain.
     * NON-CLASSICAL PRINCIPLE: Finitism & Rejection of Vacuous Truth.
     * The universal quantifier 'forall' only ranges over the known, finite set of objects.
     * Furthermore, if the domain is empty, the result is FALSE, rejecting the classical
     * notion that universal claims about an empty set are vacuously true.
     * @param expression The expression to test.
     * @returns An object containing the boolean result and an optional heuristic reason.
     */
    checkForAll(expression: Expression): { value: boolean, reason?: string } {
        if (this.objects.size === 0) {
            const reason = `\n[Heuristic: Rejection of Vacuous Truth]\nThe result is FALSE because the domain of objects is empty. Universal claims about nothing are not considered true in this logic.`;
            return { value: false, reason: reason };
        }
        const result = Array.from(this.objects).every(
            (obj) => expression.evaluate(obj).value
        );
        return { value: result };
    }

    toString(): string {
        if (this.objects.size === 0) {
            return "Domain is empty.";
        }
        const objectStates = Array.from(this.objects)
            .map(obj => `  - ${obj.toString()}`)
            .join('\n');
        return `Domain State:\n${objectStates}`;
    }
}