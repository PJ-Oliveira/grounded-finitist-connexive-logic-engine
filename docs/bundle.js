"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/engine/Domain.ts
  var Domain;
  var init_Domain = __esm({
    "src/engine/Domain.ts"() {
      "use strict";
      Domain = class {
        constructor() {
          this.objects = /* @__PURE__ */ new Set();
        }
        addObject(obj) {
          this.objects.add(obj);
        }
        getObject(name) {
          for (const obj of this.objects) {
            if (obj.name.toLowerCase() === name.toLowerCase()) {
              return obj;
            }
          }
          return void 0;
        }
        checkForAll(expression) {
          if (this.objects.size === 0) {
            const reason = `
  \x1B[36m[Heuristic: Rejection of Vacuous Truth]\x1B[0m The result is FALSE because the domain of objects is empty. Universal claims about nothing are not considered true in this logic.`;
            return { value: false, reason };
          }
          const result = Array.from(this.objects).every(
            (obj) => expression.evaluate(obj).value
          );
          return { value: result };
        }
        toString() {
          if (this.objects.size === 0) {
            return "Domain is empty.";
          }
          const objectStates = Array.from(this.objects).map((obj) => obj.toString()).join("\n  ");
          return `Domain State:
  ${objectStates}`;
        }
      };
    }
  });

  // src/engine/DomainObject.ts
  var DomainObject;
  var init_DomainObject = __esm({
    "src/engine/DomainObject.ts"() {
      "use strict";
      DomainObject = class {
        constructor(name) {
          this.name = name;
          this.predicateStates = /* @__PURE__ */ new Map();
        }
        setPredicateState(predicateName, value) {
          this.predicateStates.set(predicateName.toLowerCase(), value);
        }
        checkPredicate(predicateName) {
          return this.predicateStates.get(predicateName.toLowerCase()) || false;
        }
        /**
         * NEW METHOD: Gets the raw state of a predicate (true, false, or undefined if not set).
         * This is used to detect when the Closed-World Assumption is being applied.
         */
        getRawPredicateState(predicateName) {
          return this.predicateStates.get(predicateName.toLowerCase());
        }
        toString() {
          const states = Array.from(this.predicateStates.entries()).map(([key, value]) => `${key}=${value}`).join(", ");
          return `DomainObject{name='${this.name}', states={${states}}}`;
        }
      };
    }
  });

  // src/common/types.ts
  var EvaluationResult;
  var init_types = __esm({
    "src/common/types.ts"() {
      "use strict";
      EvaluationResult = class {
        constructor(value, explanation) {
          this.value = value;
          this.explanation = explanation;
        }
      };
    }
  });

  // src/expression/Predicate.ts
  var Predicate;
  var init_Predicate = __esm({
    "src/expression/Predicate.ts"() {
      "use strict";
      init_types();
      Predicate = class _Predicate {
        constructor(name) {
          this.name = name;
        }
        evaluate(object) {
          const rawValue = object.getRawPredicateState(this.name);
          const value = rawValue === void 0 ? false : rawValue;
          let explanation = `Fact '${this.name}' is ${value ? "TRUE" : "FALSE"} for object '${object.name}'`;
          if (rawValue === void 0) {
            explanation += `
  \x1B[36m[Heuristic: Closed-World Assumption]\x1B[0m The fact was not explicitly set to TRUE, so it is assumed to be FALSE. Classical logic might consider its truth value 'unknown'.`;
          }
          return new EvaluationResult(value, explanation);
        }
        getAtomicPredicates() {
          return /* @__PURE__ */ new Set([this.name]);
        }
        toTreeString() {
          return `"${this.name}"`;
        }
        equals(other) {
          return other instanceof _Predicate && this.name === other.name;
        }
      };
    }
  });

  // src/expression/And.ts
  var And;
  var init_And = __esm({
    "src/expression/And.ts"() {
      "use strict";
      init_types();
      And = class _And {
        constructor(left, right) {
          this.left = left;
          this.right = right;
        }
        evaluate(object) {
          const leftResult = this.left.evaluate(object);
          const rightResult = this.right.evaluate(object);
          const finalValue = leftResult.value && rightResult.value;
          const reason = `(${leftResult.value} AND ${rightResult.value}) -> ${finalValue}`;
          return new EvaluationResult(finalValue, reason);
        }
        getAtomicPredicates() {
          const combined = new Set(this.left.getAtomicPredicates());
          this.right.getAtomicPredicates().forEach((p) => combined.add(p));
          return combined;
        }
        toTreeString() {
          return `(${this.left.toTreeString()} AND ${this.right.toTreeString()})`;
        }
        equals(other) {
          return other instanceof _And && this.left.equals(other.left) && this.right.equals(other.right);
        }
      };
    }
  });

  // src/expression/Or.ts
  var Or;
  var init_Or = __esm({
    "src/expression/Or.ts"() {
      "use strict";
      init_types();
      Or = class _Or {
        constructor(left, right) {
          this.left = left;
          this.right = right;
        }
        evaluate(object) {
          const leftResult = this.left.evaluate(object);
          const rightResult = this.right.evaluate(object);
          const finalValue = leftResult.value || rightResult.value;
          const reason = `(${leftResult.value} OR ${rightResult.value}) -> ${finalValue}`;
          return new EvaluationResult(finalValue, reason);
        }
        getAtomicPredicates() {
          const combined = new Set(this.left.getAtomicPredicates());
          this.right.getAtomicPredicates().forEach((p) => combined.add(p));
          return combined;
        }
        toTreeString() {
          return `(${this.left.toTreeString()} OR ${this.right.toTreeString()})`;
        }
        equals(other) {
          return other instanceof _Or && this.left.equals(other.left) && this.right.equals(other.right);
        }
      };
    }
  });

  // src/expression/Not.ts
  var Not;
  var init_Not = __esm({
    "src/expression/Not.ts"() {
      "use strict";
      init_types();
      Not = class _Not {
        constructor(expression) {
          this.expression = expression;
        }
        evaluate(object) {
          const innerResult = this.expression.evaluate(object);
          const finalValue = !innerResult.value;
          const explanation = `Negation (NOT) is ${finalValue ? "TRUE" : "FALSE"} because the inner expression evaluated to ${innerResult.value ? "TRUE" : "FALSE"}.
  - Inner Eval: ${innerResult.explanation.replace(/\n/g, "\n  ")}`;
          return new EvaluationResult(finalValue, explanation);
        }
        getAtomicPredicates() {
          return this.expression.getAtomicPredicates();
        }
        toTreeString() {
          return `(NOT ${this.expression.toTreeString()})`;
        }
        equals(other) {
          return other instanceof _Not && this.expression.equals(other.expression);
        }
      };
    }
  });

  // src/expression/RelevantImplication.ts
  var RelevantImplication;
  var init_RelevantImplication = __esm({
    "src/expression/RelevantImplication.ts"() {
      "use strict";
      init_types();
      init_Not();
      RelevantImplication = class _RelevantImplication {
        constructor(antecedent, consequent) {
          this.antecedent = antecedent;
          this.consequent = consequent;
        }
        evaluate(object) {
          const antecedentResult = this.antecedent.evaluate(object);
          const consequentResult = this.consequent.evaluate(object);
          const classicalTruth = !antecedentResult.value || consequentResult.value;
          const antecedentPredicates = this.antecedent.getAtomicPredicates();
          const consequentPredicates = this.consequent.getAtomicPredicates();
          const isRelevant = [...consequentPredicates].every(
            (predicate) => antecedentPredicates.has(predicate)
          );
          let isAristotleCoherent = true;
          if (this.antecedent instanceof Not) {
            const notAntecedent = this.antecedent;
            if (notAntecedent.expression.equals(this.consequent)) {
              isAristotleCoherent = false;
            }
          }
          const oppositeConsequentResult = new Not(this.consequent).evaluate(object);
          const oppositeClassicalTruth = !antecedentResult.value || oppositeConsequentResult.value;
          const isBoethiusViolation = classicalTruth && oppositeClassicalTruth;
          const finalValue = classicalTruth && isRelevant && isAristotleCoherent && !isBoethiusViolation;
          let reason = `Classical: ${classicalTruth}, Relevant: ${isRelevant}, Aristotle Coherent: ${isAristotleCoherent}, Boethius Coherent: ${!isBoethiusViolation} -> Final: ${finalValue}`;
          if (!isRelevant) {
            reason += `
  \x1B[36m[Heuristic: Relevance Logic]\x1B[0m Implication failed. The consequent cannot introduce new topics (predicates) that were not present in the antecedent.`;
          }
          if (!isAristotleCoherent) {
            reason += `
  \x1B[36m[Heuristic: Connexive Logic (Aristotle's Thesis)]\x1B[0m Implication failed. A proposition cannot be implied by its own negation (form: NOT P -> P).`;
          }
          if (isBoethiusViolation) {
            reason += `
  \x1B[36m[Heuristic: Connexive Logic (Boethius's Thesis)]\x1B[0m Implication failed. An antecedent cannot imply both a proposition and its negation (form: (A -> C) and (A -> NOT C)).`;
          }
          return new EvaluationResult(finalValue, reason);
        }
        getAtomicPredicates() {
          const combined = new Set(this.antecedent.getAtomicPredicates());
          this.consequent.getAtomicPredicates().forEach((p) => combined.add(p));
          return combined;
        }
        toTreeString() {
          return `(${this.antecedent.toTreeString()} RELEVANTLY_IMPLIES ${this.consequent.toTreeString()})`;
        }
        equals(other) {
          return other instanceof _RelevantImplication && this.antecedent.equals(other.antecedent) && this.consequent.equals(other.consequent);
        }
      };
    }
  });

  // src/ui/ExpressionParser.ts
  function isOperator(token) {
    return token.toUpperCase() in PRECEDENCE;
  }
  function applyOperator(values, operator) {
    const op = operator.toUpperCase();
    if (op === "NOT") {
      if (values.length < 1) throw new Error(`Invalid syntax for NOT operator.`);
      const operand = values.pop();
      values.push(new Not(operand));
      return;
    }
    if (values.length < 2) throw new Error(`Invalid syntax for binary operator ${op}`);
    const right = values.pop();
    const left = values.pop();
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
  function parse(tokens) {
    if (tokens.length === 0) {
      throw new Error("Cannot parse an empty expression.");
    }
    const values = [];
    const operators = [];
    for (const token of tokens) {
      const upperToken = token.toUpperCase();
      if (isOperator(upperToken)) {
        while (operators.length > 0 && operators[operators.length - 1] !== "(" && // Don't pop parentheses
        PRECEDENCE[operators[operators.length - 1]] >= PRECEDENCE[upperToken]) {
          applyOperator(values, operators.pop());
        }
        operators.push(upperToken);
      } else if (token === "(") {
        operators.push(token);
      } else if (token === ")") {
        while (operators.length > 0 && operators[operators.length - 1] !== "(") {
          applyOperator(values, operators.pop());
        }
        if (operators.length === 0) {
          throw new Error("Mismatched parentheses: no matching '(' found.");
        }
        operators.pop();
      } else {
        values.push(new Predicate(token));
      }
    }
    while (operators.length > 0) {
      const operator = operators.pop();
      if (operator === "(") {
        throw new Error("Mismatched parentheses: remaining '(' on stack.");
      }
      applyOperator(values, operator);
    }
    if (values.length !== 1) {
      throw new Error("Invalid expression syntax: check operators and operands.");
    }
    return values[0];
  }
  var PRECEDENCE, ExpressionParser;
  var init_ExpressionParser = __esm({
    "src/ui/ExpressionParser.ts"() {
      "use strict";
      init_Predicate();
      init_And();
      init_Or();
      init_Not();
      init_RelevantImplication();
      PRECEDENCE = {
        "NOT": 4,
        "AND": 3,
        "OR": 2,
        "RELEVANTLY_IMPLIES": 1
      };
      ExpressionParser = { parse };
    }
  });

  // src/main.ts
  var require_main = __commonJS({
    "src/main.ts"() {
      init_Domain();
      init_DomainObject();
      init_ExpressionParser();
      var PROMPT_STRING = "\x1B[1;32mlogic>\x1B[0m ";
      var term = new Terminal({
        cursorBlink: true,
        fontFamily: "'Fira Code', monospace",
        fontSize: 14,
        theme: {
          background: "#1e1e1e",
          foreground: "#e0e0e0",
          cursor: "#e0e0e0",
          selectionBackground: "#555"
        },
        cancelEvents: true
      });
      var fitAddon = new FitAddon.FitAddon();
      term.loadAddon(fitAddon);
      term.open(document.getElementById("terminal"));
      fitAddon.fit();
      window.addEventListener("resize", () => fitAddon.fit());
      var universe = new Domain();
      var commandHistory = [];
      var historyIndex = -1;
      var currentLine = "";
      function printWelcomeMessage() {
        term.writeln("--- Grounded Finitist Connexive Logic Engine (TypeScript/Web Edition) ---");
        term.writeln("Type 'help' for commands or 'exit' to quit.");
        term.writeln("--------------------------------------------------------------------------");
      }
      function printHelp() {
        term.writeln("");
        term.writeln("\x1B[1;33m--- Core Principles ---\x1B[0m");
        term.writeln("1. \x1B[1mFINITE DOMAIN\x1B[0m: The 'forall' quantifier is ALWAYS restricted to a known set.");
        term.writeln("2. \x1B[1mRELEVANT IMPLICATION\x1B[0m: The system exclusively uses a stricter, multi-layered implication.");
        term.writeln("");
        term.writeln("\x1B[1;33m--- Available Commands (without <>) ---\x1B[0m");
        term.writeln("\x1B[1mdomain add ObjectName\x1B[0m                     - Adds an object to the finite universe.");
        term.writeln("\x1B[1mfact ObjectName predicateName\x1B[0m            - Defines an atomic predicate as true for an object.");
        term.writeln("\x1B[1mquery ObjectName Expression?\x1B[0m            - Evaluates a complex expression for a specific object.");
        term.writeln("\x1B[1mcheck forall Expression?\x1B[0m                  - Evaluates if an expression is true for all objects in the domain.");
        term.writeln("\x1B[1mstate\x1B[0m                                       - Shows the current state of all objects and their facts.");
        term.writeln("\x1B[1mhelp\x1B[0m                                        - Shows this help message.");
        term.writeln("\x1B[1mexit\x1B[0m                                        - Exits the program (closes this terminal).");
        term.writeln("\x1B[1mclear\x1B[0m                                       - Clears the terminal screen.");
        term.writeln("");
        term.writeln("\x1B[1;33m--- Expression Syntax ---\x1B[0m");
        term.writeln("Use parentheses \x1B[1m()\x1B[0m for grouping.");
        term.writeln("Predicates: \x1B[1misMortal\x1B[0m, \x1B[1mis_human\x1B[0m, etc. (must be single words, no spaces).");
        term.writeln("Operators (by precedence): \x1B[1mNOT > AND > OR > RELEVANTLY_IMPLIES\x1B[0m.");
        term.writeln("  \x1B[1mRELEVANTLY_IMPLIES\x1B[0m: A stricter implication.");
        term.writeln("");
        term.writeln("\x1B[1mExample\x1B[0m: query socrates ( isHuman AND isGreek ) RELEVANTLY_IMPLIES isHuman ?");
        term.writeln("--------------------------------------------------------------------------");
      }
      function parseCommandLine(input) {
        const tokens = [];
        const regex = /"([^"]*)"|\S+/g;
        let match;
        while ((match = regex.exec(input)) !== null) {
          tokens.push(match[1] || match[0]);
        }
        return tokens;
      }
      function cleanExpressionTokens(tokens) {
        if (tokens.length === 0) return;
        const lastIndex = tokens.length - 1;
        const lastToken = tokens[lastIndex];
        if (lastToken.endsWith("?")) {
          const cleanedToken = lastToken.slice(0, -1);
          if (cleanedToken) {
            tokens[lastIndex] = cleanedToken;
          } else {
            tokens.pop();
          }
        }
      }
      function handleCommand(line) {
        const parts = parseCommandLine(line);
        if (parts.length === 0) {
          return;
        }
        const command = parts[0].toLowerCase();
        try {
          switch (command) {
            case "domain":
              if (parts.length === 3 && parts[1].toLowerCase() === "add") {
                universe.addObject(new DomainObject(parts[2]));
                term.writeln(`Object '${parts[2]}' added to the domain.`);
              } else {
                term.writeln("\x1B[1;31mError: Invalid 'domain' command. Use: domain add ObjectName\x1B[0m");
              }
              break;
            case "fact":
              if (parts.length === 3) {
                const obj = universe.getObject(parts[1]);
                if (obj) {
                  obj.setPredicateState(parts[2], true);
                  term.writeln(`Fact defined: ${obj.name} -> '${parts[2]}' is true.`);
                } else {
                  term.writeln(`\x1B[1;31mError: Object '${parts[1]}' not found.\x1B[0m`);
                }
              } else {
                term.writeln("\x1B[1;31mError: Invalid 'fact' command. Use: fact ObjectName predicateName\x1B[0m");
              }
              break;
            case "query": {
              if (parts.length < 3) {
                term.writeln("\x1B[1;31mError: Invalid 'query' command. Use: query ObjectName Expression?\x1B[0m");
                return;
              }
              const obj = universe.getObject(parts[1]);
              if (obj) {
                const exprTokens = parts.slice(2);
                cleanExpressionTokens(exprTokens);
                const expression = ExpressionParser.parse(exprTokens);
                const result = expression.evaluate(obj);
                term.writeln("");
                term.writeln("\x1B[1;36m==================== QUERY RESULT ====================\x1B[0m");
                term.writeln(`\x1B[1mExpression:\x1B[0m ${expression.toTreeString()}`);
                term.writeln(`\x1B[1mFor Object:\x1B[0m ${obj.name}`);
                term.writeln(`\x1B[1mFinal Result:\x1B[0m \x1B[1;${result.value ? "32mTRUE" : "31mFALSE"}\x1B[0m`);
                term.writeln("\x1B[1;36m-------------------- Derivation --------------------\x1B[0m");
                term.writeln(result.explanation);
                term.writeln("\x1B[1;36m====================================================\x1B[0m");
              } else {
                term.writeln(`\x1B[1;31mError: Object '${parts[1]}' not found.\x1B[0m`);
              }
              break;
            }
            case "check": {
              let expressionTokens;
              if (parts.length >= 3 && parts[1].toLowerCase() === "forall") {
                expressionTokens = parts.slice(2);
              } else if (parts.length >= 4 && parts[1].toLowerCase() === "for" && parts[2].toLowerCase() === "all") {
                expressionTokens = parts.slice(3);
              } else {
                term.writeln("\x1B[1;31mError: Invalid 'check' command. Use: check forall Expression?\x1B[0m");
                return;
              }
              if (expressionTokens.length === 0) {
                term.writeln("\x1B[1;31mError: Missing expression for 'check forall' command.\x1B[0m");
                return;
              }
              cleanExpressionTokens(expressionTokens);
              const expression = ExpressionParser.parse(expressionTokens);
              const result = universe.checkForAll(expression);
              term.writeln(`Result for ALL objects: \x1B[1;${result.value ? "32mTRUE" : "31mFALSE"}\x1B[0m`);
              if (result.reason) {
                term.writeln(result.reason);
              }
              break;
            }
            case "state":
              term.writeln(universe.toString());
              break;
            case "help":
              printHelp();
              break;
            case "exit":
              term.writeln("Goodbye!");
              setTimeout(() => window.close(), 1e3);
              break;
            case "clear":
              term.clear();
              break;
            default:
              term.writeln(`\x1B[1;31mUnknown command: '${command}'. Type 'help' for a list of commands.\x1B[0m`);
          }
        } catch (e) {
          term.writeln(`\x1B[1;31mError: ${e.message}\x1B[0m`);
        }
      }
      printWelcomeMessage();
      term.write(PROMPT_STRING);
      var PROMPT_VISIBLE_LENGTH = PROMPT_STRING.replace(/[\u001b\u009b][[()#;?]?[0-9]{1,4}(?:;[0-9]{0,4})*[0-9A-ORZcf-nqry=><]/g, "").length;
      term.onKey(({ key, domEvent }) => {
        const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
        if (domEvent.key === "Enter") {
          term.writeln("");
          if (currentLine.trim()) {
            if (commandHistory[0] !== currentLine) {
              commandHistory.unshift(currentLine);
            }
            handleCommand(currentLine);
          }
          historyIndex = -1;
          currentLine = "";
          term.write(PROMPT_STRING);
        } else if (domEvent.key === "Backspace") {
          if (term.buffer.active.cursorX > PROMPT_VISIBLE_LENGTH) {
            currentLine = currentLine.slice(0, -1);
            term.write("\b \b");
          }
        } else if (domEvent.key === "ArrowUp") {
          if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            const clearLine = "\x1B[2K\r" + PROMPT_STRING;
            term.write(clearLine);
            currentLine = commandHistory[historyIndex];
            term.write(currentLine);
          }
        } else if (domEvent.key === "ArrowDown") {
          if (historyIndex > 0) {
            historyIndex--;
            const clearLine = "\x1B[2K\r" + PROMPT_STRING;
            term.write(clearLine);
            currentLine = commandHistory[historyIndex];
            term.write(currentLine);
          } else {
            historyIndex = -1;
            const clearLine = "\x1B[2K\r" + PROMPT_STRING;
            term.write(clearLine);
            currentLine = "";
          }
        } else if (printable && domEvent.key.length === 1) {
          currentLine += domEvent.key;
          term.write(domEvent.key);
        }
      });
    }
  });
  require_main();
})();
