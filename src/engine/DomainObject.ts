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
    
    toString(): string {
        const states = Array.from(this.predicateStates.entries())
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');
        return `DomainObject{name='${this.name}', states={${states}}}`;
    }
}