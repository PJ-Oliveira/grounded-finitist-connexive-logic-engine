import { Expression } from '../common/types';
import { Predicate } from '../expression/Predicate';
import { And } from '../expression/And';
import { Or } from '../expression/Or';
import { Not } from '../expression/Not';
import { RelevantImplication } from '../expression/RelevantImplication';

// Defines the precedence of each operator. Higher numbers are evaluated first.
const PRECEDENCE: { [key: string]: number } = {
    "NOT": 4,
    "AND": 3,
    "OR": 2,
    "RELEVANTLY_IMPLIES": 1,
};

// Helper function to check if a token is a known operator.
function isOperator(token: string): boolean {
    return token.toUpperCase() in PRECEDENCE;
}

// Applies an operator to the values on the stack.
function applyOperator(values: Expression[], operator: string): void {
    const op = operator.toUpperCase();

    if (op === "NOT") {
        if (values.length < 1) throw new Error(`Invalid syntax for NOT operator.`);
        const operand = values.pop()!;
        values.push(new Not(operand));
        return;
    }

    // All other operators are binary
    if (values.length < 2) throw new Error(`Invalid syntax for binary operator ${op}`);
    const right = values.pop()!;
    const left = values.pop()!;

    switch (op) {
        case "AND": 
            values.push(new And(left, right)); 
            break;
        case "OR": 
            values.push(new Or(left, right)); 
            break;
        case "RELEVANTLY_IMPLIES": 
            values.push(new RelevantImplication(left, right)); 
            break;
        default: 
            throw new Error(`Unknown operator: ${op}`);
    }
}

/**
 * Parses a flat list of tokens into a nested Expression tree using the Shunting-yard algorithm.
 * @param tokens An array of strings representing the expression.
 * @returns A single root Expression object.
 */
function parse(tokens: string[]): Expression {
    if (tokens.length === 0) {
        throw new Error("Cannot parse an empty expression.");
    }
    
    const values: Expression[] = [];    // Output queue (as a stack)
    const operators: string[] = []; // Operator stack

    for (const token of tokens) {
        const upperToken = token.toUpperCase();

        if (isOperator(upperToken)) {
            // While there's an operator on the stack with higher or equal precedence, apply it.
            while (
                operators.length > 0 &&
                operators[operators.length - 1] !== '(' && // Don't pop parentheses
                PRECEDENCE[operators[operators.length - 1]] >= PRECEDENCE[upperToken]
            ) {
                applyOperator(values, operators.pop()!);
            }
            operators.push(upperToken);
        } else if (token === '(') {
            operators.push(token);
        } else if (token === ')') {
            // A closing parenthesis is found, apply operators until we find the matching open parenthesis.
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                applyOperator(values, operators.pop()!);
            }
            if (operators.length === 0) {
                throw new Error("Mismatched parentheses: no matching '(' found.");
            }
            operators.pop(); // Pop the '(' from the stack.
        } else {
            // If it's not an operator or parenthesis, it's a value (predicate).
            values.push(new Predicate(token));
        }
    }

    // Apply any remaining operators on the stack.
    while (operators.length > 0) {
        const operator = operators.pop()!;
        if (operator === '(') {
            throw new Error("Mismatched parentheses: remaining '(' on stack.");
        }
        applyOperator(values, operator);
    }

    // At the end, there should be exactly one value on the stack: the root of the expression tree.
    if (values.length !== 1) {
        throw new Error("Invalid expression syntax: check operators and operands.");
    }
    
    return values[0];
}

export const ExpressionParser = { parse };