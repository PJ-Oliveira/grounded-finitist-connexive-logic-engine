import { DomainObject } from './DomainObject';
import { Expression } from '../common/types';

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

    checkForAll(expression: Expression): boolean {
        if (this.objects.size === 0) {
            return false; // Non-classical axiom for empty domains.
        }
        return Array.from(this.objects).every(
            (obj) => expression.evaluate(obj).value
        );
    }

    toString(): string {
        if (this.objects.size === 0) {
            return "Domain is empty.";
        }
        const objectStates = Array.from(this.objects)
            .map(obj => obj.toString())
            .join('\n  ');
        return `Domain State:\n  ${objectStates}`;
    }
}