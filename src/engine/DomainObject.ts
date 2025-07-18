export class DomainObject {
    private readonly predicateStates = new Map<string, boolean>();

    constructor(public readonly name: string) {}

    setPredicateState(predicateName: string, value: boolean): void {
        this.predicateStates.set(predicateName.toLowerCase(), value);
    }

    checkPredicate(predicateName: string): boolean {
        // Implements the Closed-World Assumption.
        return this.predicateStates.get(predicateName.toLowerCase()) || false;
    }

    /**
     * NEW METHOD: Gets the raw state of a predicate (true, false, or undefined if not set).
     * This is used to detect when the Closed-World Assumption is being applied.
     */
    getRawPredicateState(predicateName: string): boolean | undefined {
        return this.predicateStates.get(predicateName.toLowerCase());
    }
    
    toString(): string {
        const states = Array.from(this.predicateStates.entries())
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');
        return `DomainObject{name='${this.name}', states={${states}}}`;
    }
}