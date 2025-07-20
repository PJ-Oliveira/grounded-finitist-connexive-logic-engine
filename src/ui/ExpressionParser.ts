// src/ui/ExpressionParser.ts

import { Expression } from '../common/types';
import { Predicate } from '../expression/Predicate';
import { And } from '../expression/And';
import { Or } from '../expression/Or';
import { Not } from '../expression/Not';
import { RelevantImplication } from '../expression/RelevantImplication';
import { Logger } from '../common/Logger';

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
    const op = operator.toUpperCase();
    Logger.debug(`Applying operator: ${op}`);

    if (op === "NOT") {
        if (values.length < 1) throw new Error(`Invalid syntax for NOT operator.`);
        values.push(new Not(values.pop()!));
        return;
    }
    
    if (values.length < 2) throw new Error(`Invalid syntax for binary operator ${op}`);
    const right = values.pop()!;
    const left = values.pop()!;
    
    switch (op) {
        case "AND": values.push(new And(left, right)); break;
        case "OR": values.push(new Or(left, right)); break;
        case "RELEVANTLY_IMPLIES": values.push(new RelevantImplication(left, right)); break;
        default: throw new Error(`Unknown operator: ${op}`);
    }
}

/**
 * Parses a flat list of tokens into a nested Expression tree using the Shunting-yard algorithm.
 * @param tokens An array of strings representing the expression.
 * @returns A single root Expression object.
 */
function parse(tokens: string[]): Expression {
    Logger.debug('--- Starting Expression Parser ---', { tokens });

    if (tokens.length === 0) {
        throw new Error("Cannot parse an empty expression.");
    }
    
    const values: Expression[] = [];
    const operators: string[] = [];

    for (const token of tokens) {
        Logger.debug(`Processing token: '${token}'`);
        const upperToken = token.toUpperCase();

        if (isOperator(upperToken)) {
            while (
                operators.length > 0 &&
                operators[operators.length - 1] !== '(' &&
                PRECEDENCE[operators[operators.length - 1]] >= PRECEDENCE[upperToken]
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
            if (operators.length === 0) throw new Error("Mismatched parentheses: no matching '(' found.");
            operators.pop(); // Pop the '(' from the stack.
        } else {
            values.push(new Predicate(token));
        }
        Logger.debug('Stacks after processing:', {
            values: values.map(v => v.toTreeString()),
            operators: [...operators]
        });
    }

    Logger.debug('--- Applying remaining operators ---');
    while (operators.length > 0) {
        const operator = operators.pop()!;
        if (operator === '(') throw new Error("Mismatched parentheses: remaining '(' on stack.");
        applyOperator(values, operator);
    }

    if (values.length !== 1) {
        Logger.error('FINAL PARSER CHECK FAILED!', { finalValueCount: values.length, values });
        throw new Error("Invalid expression syntax: check operators and operands.");
    }
    
    Logger.debug('Parsing successful.', { rootExpression: values[0].toTreeString() });
    return values[0];
}

export const ExpressionParser = { parse };