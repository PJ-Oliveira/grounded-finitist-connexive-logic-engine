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

    checkForAll(expression: Expression): { value: boolean, reason?: string } {
        if (this.objects.size === 0) {
            // HEURISTIC: Rejection of Vacuous Truth
            const reason = `\n\n\x1b[36m[Heuristic: Rejection of Vacuous Truth]\x1b[0m The result is FALSE because the domain of objects is empty. Universal claims about nothing are not considered true in this logic.`;
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
            .map(obj => obj.toString())
            .join('\n  ');
        return `Domain State:\n  ${objectStates}`;
    }
}