// src/engine/DomainObject.ts

/**
 * Represents a single object within the logical universe.
 * Each object has a name and maintains a map of its known true/false predicates.
 */
export class DomainObject {
    private readonly predicateStates = new Map<string, boolean>();

    constructor(public readonly name: string) {}

    /**
     * Defines a fact (a predicate's state) for this object.
     * @param predicateName The name of the predicate, e.g., "isMortal".
     * @param value The truth value of the predicate.
     */
    setPredicateState(predicateName: string, value: boolean): void {
        this.predicateStates.set(predicateName.toLowerCase(), value);
    }

    /**
     * Checks the truth value of a predicate for this object.
     * NON-CLASSICAL PRINCIPLE: This method implements the Closed-World Assumption (CWA).
     * If a predicate has not been explicitly set, it is assumed to be FALSE.
     * This contrasts with classical logic, where its value would be considered 'unknown'.
     * @param predicateName The name of the predicate to check.
     * @returns `true` or `false`.
     */
    checkPredicate(predicateName: string): boolean {
        return this.predicateStates.get(predicateName.toLowerCase()) || false;
    }

    /**
     * Gets the raw state of a predicate (true, false, or undefined if not explicitly set).
     * This is used by Expression evaluators to detect when the CWA is being applied
     * in order to provide explanatory heuristics.
     * @param predicateName The name of the predicate to check.
     * @returns `true`, `false`, or `undefined`.
     */
    getRawPredicateState(predicateName: string): boolean | undefined {
        return this.predicateStates.get(predicateName.toLowerCase());
    }
    
    toString(): string {
        if (this.predicateStates.size === 0) {
            return `DomainObject{name='${this.name}', states={EMPTY}}`;
        }
        const states = Array.from(this.predicateStates.entries())
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');
        return `DomainObject{name='${this.name}', states={${states}}}`;
    }
}