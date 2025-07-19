import { Expression } from "../common/types";
import { Predicate } from "../expression/Predicate";
import { And } from "../expression/And";
import { Or } from "../expression/Or";
import { Not } from "../expression/Not";
import { RelevantImplication } from "../expression/RelevantImplication";

// --- Parser with Hyper-Verbose Logging for Deep Debugging ---

const PRECEDENCE: { [key: string]: number } = {
  NOT: 4,
  AND: 3,
  OR: 2,
  RELEVANTLY_IMPLIES: 1,
};

function isOperator(token: string): boolean {
  return token.toUpperCase() in PRECEDENCE;
}

function applyOperator(values: Expression[], operator: string): void {
  const op = operator.toUpperCase();
  console.log(
    `%cApplying operator: ${op}`,
    "color: #FFC300; font-weight: bold;"
  );

  if (op === "NOT") {
    if (values.length < 1)
      throw new Error(`INVALID STATE: Not enough values for NOT operator.`);
    console.log(
      "  - Popping operand for NOT:",
      values[values.length - 1]?.toTreeString()
    );
    values.push(new Not(values.pop()!));
    return;
  }

  if (values.length < 2)
    throw new Error(
      `INVALID STATE: Not enough values for binary operator ${op}`
    );
  const right = values.pop()!;
  const left = values.pop()!;
  console.log(`  - Popped left operand: ${left.toTreeString()}`);
  console.log(`  - Popped right operand: ${right.toTreeString()}`);

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

function parse(tokens: string[]): Expression {
  console.clear();
  console.log(
    "%c--- Starting Expression Parser (Hyper-Verbose Mode) ---",
    "font-weight: bold; font-size: 14px; color: #58D68D"
  );
  console.log("Input tokens:", JSON.parse(JSON.stringify(tokens)));

  if (tokens.length === 0) throw new Error("Cannot parse an empty expression.");

  const values: Expression[] = [];
  const operators: string[] = [];

  for (const token of tokens) {
    console.log(
      `\nProcessing token: %c'${token}'`,
      "color: cyan; font-weight: bold;"
    );
    const upperToken = token.toUpperCase();

    if (isOperator(upperToken)) {
      console.log("It is an operator.");
      while (
        operators.length > 0 &&
        operators[operators.length - 1] !== "(" &&
        PRECEDENCE[operators[operators.length - 1]] >= PRECEDENCE[upperToken]
      ) {
        const topOp = operators[operators.length - 1];
        console.log(
          `  -> Precedence rule met: Top operator '${topOp}' (prec: ${PRECEDENCE[topOp]}) >= current operator '${upperToken}' (prec: ${PRECEDENCE[upperToken]}). Applying top operator.`
        );
        applyOperator(values, operators.pop()!);
      }
      operators.push(upperToken);
    } else if (token === "(") {
      console.log("It is a left parenthesis.");
      operators.push(token);
    } else if (token === ")") {
      console.log("It is a right parenthesis.");
      while (operators.length > 0 && operators[operators.length - 1] !== "(") {
        applyOperator(values, operators.pop()!);
      }
      if (operators.length === 0)
        throw new Error("Mismatched parentheses: no matching '(' found.");
      console.log("  -> Found matching '('. Popping it from operator stack.");
      operators.pop(); // Pop the '('
    } else {
      console.log("It is a value (predicate).");
      values.push(new Predicate(token));
    }
    console.log("%cStacks after processing:", "color: #AED6F1", {
      values: values.map((v) => v.toTreeString()),
      operators: [...operators],
    });
  }

  console.log(
    "\n%c--- Applying remaining operators ---",
    "font-weight: bold; color: #58D68D"
  );
  while (operators.length > 0) {
    const operator = operators.pop()!;
    if (operator === "(")
      throw new Error("Mismatched parentheses: remaining '(' on stack.");
    applyOperator(values, operator);
    console.log("%cStacks after applying remaining op:", "color: #AED6F1", {
      values: values.map((v) => v.toTreeString()),
      operators: [...operators],
    });
  }

  console.log("\n%c--- Final Check ---", "font-weight: bold; color: #58D68D");
  console.log("Final values stack size:", values.length);
  console.log(
    "Final values stack content:",
    values.map((v) => v.toTreeString())
  );

  if (values.length !== 1) {
    console.error(
      "FINAL CHECK FAILED! Stack should have 1 item, but has",
      values.length
    );
    throw new Error("Invalid expression syntax: check operators and operands.");
  }

  console.log(
    "%cParsing successful. Final Expression Object:",
    "color: green; font-weight: bold;",
    values[0]
  );
  return values[0];
}

export const ExpressionParser = { parse };
