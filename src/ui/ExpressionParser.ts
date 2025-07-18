import { Expression } from '../common/types';
import { Predicate } from '../expression/Predicate';
import { And } from '../expression/And';
import { Or } from '../expression/Or';
import { Not } from '../expression/Not';
import { RelevantImplication } from '../expression/RelevantImplication';

const PRECEDENCE: { [key: string]: number } = {
    "NOT": 4,
    "AND": 3,
    "OR": 2,
    "RELEVANTLY_IMPLIES": 1,
};

function isOperator(token: string): boolean {
    return token.toUpperCase() in PRECEDENCE;
}

function applyOperator(values: Expression[], operator: string): void {
    if (operator === "NOT") {
        if (values.length < 1) throw new Error("Invalid syntax for NOT operator.");
        values.push(new Not(values.pop()!));
        return;
    }

    if (values.length < 2) throw new Error(`Invalid syntax for binary operator ${operator}`);
    const right = values.pop()!;
    const left = values.pop()!;

    switch (operator) {
        case "AND": values.push(new And(left, right)); break;
        case "OR": values.push(new Or(left, right)); break;
        case "RELEVANTLY_IMPLIES": values.push(new RelevantImplication(left, right)); break;
        default: throw new Error(`Unknown operator: ${operator}`);
    }
}

function parse(tokens: string[]): Expression {
    const values: Expression[] = [];
    const operators: string[] = [];

    for (const token of tokens) {
        const upperToken = token.toUpperCase();
        if (isOperator(upperToken)) {
            while (
                operators.length > 0 &&
                isOperator(operators[operators.length - 1]) &&
                PRECEDENCE[operators[operators.length - 1].toUpperCase()] >= PRECEDENCE[upperToken]
            ) {
                applyOperator(values, operators.pop()!);
            }
            operators.push(upperToken);
        } else if (token === '(') {
            operators.push(token);
        } else if (token === ')') {
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                applyOperator(values, operators.pop()!);
            }
            if (operators.length === 0) throw new Error("Mismatched parentheses.");
            operators.pop(); // Pop '('
        } else {
            values.push(new Predicate(token));
        }
    }

    while (operators.length > 0) {
        if (operators[operators.length - 1] === '(') throw new Error("Mismatched parentheses.");
        applyOperator(values, operators.pop()!);
    }

    if (values.length !== 1) throw new Error("Invalid expression syntax.");
    return values[0];
}

export const ExpressionParser = { parse };