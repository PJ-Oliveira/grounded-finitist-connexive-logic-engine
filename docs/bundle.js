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
            return false;
          }
          return Array.from(this.objects).every(
            (obj) => expression.evaluate(obj).value
          );
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
          const value = object.checkPredicate(this.name);
          const explanation = `Fact '${this.name}' is ${value ? "TRUE" : "FALSE"} for object '${object.name}'`;
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
          if (!classicalTruth) {
            const reason2 = `Failed classical implication check: !(antecedent:${antecedentResult.value}) || (consequent:${consequentResult.value})`;
            return new EvaluationResult(false, reason2);
          }
          const antecedentPredicates = this.antecedent.getAtomicPredicates();
          const consequentPredicates = this.consequent.getAtomicPredicates();
          const intersection = new Set([...antecedentPredicates].filter((p) => consequentPredicates.has(p)));
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
          const oppositeClassicalTruth = !antecedentResult.value || !consequentResult.value;
          const isBoethiusViolation = classicalTruth && oppositeClassicalTruth;
          const finalValue = classicalTruth && isRelevant && isAristotleCoherent && !isBoethiusViolation;
          const reason = `Classical: ${classicalTruth}, Relevant: ${isRelevant}, Aristotle Coherent: ${isAristotleCoherent}, Boethius Coherent: ${!isBoethiusViolation} -> Final: ${finalValue}`;
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
    if (operator === "NOT") {
      if (values.length < 1) throw new Error("Invalid syntax for NOT operator.");
      values.push(new Not(values.pop()));
      return;
    }
    if (values.length < 2) throw new Error(`Invalid syntax for binary operator ${operator}`);
    const right = values.pop();
    const left = values.pop();
    switch (operator) {
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
        throw new Error(`Unknown operator: ${operator}`);
    }
  }
  function parse(tokens) {
    const values = [];
    const operators = [];
    for (const token of tokens) {
      const upperToken = token.toUpperCase();
      if (isOperator(upperToken)) {
        while (operators.length > 0 && isOperator(operators[operators.length - 1]) && PRECEDENCE[operators[operators.length - 1].toUpperCase()] >= PRECEDENCE[upperToken]) {
          applyOperator(values, operators.pop());
        }
        operators.push(upperToken);
      } else if (token === "(") {
        operators.push(token);
      } else if (token === ")") {
        while (operators.length > 0 && operators[operators.length - 1] !== "(") {
          applyOperator(values, operators.pop());
        }
        if (operators.length === 0) throw new Error("Mismatched parentheses.");
        operators.pop();
      } else {
        values.push(new Predicate(token));
      }
    }
    while (operators.length > 0) {
      if (operators[operators.length - 1] === "(") throw new Error("Mismatched parentheses.");
      applyOperator(values, operators.pop());
    }
    if (values.length !== 1) throw new Error("Invalid expression syntax.");
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
        }
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
        term.writeln("1. \x1B[1mFINITE DOMAIN\x1B[0m: The 'forall' quantifier is ALWAYS restricted.");
        term.writeln("2. \x1B[1mMULTI-LAYERED IMPLICATION\x1B[0m: The system exclusively uses a stricter, multi-layered implication.");
        term.writeln("");
        term.writeln("\x1B[1;33m--- Available Commands ---\x1B[0m");
        term.writeln("\x1B[1mdomain add <ObjectName>\x1B[0m                     - Adds an object to the finite universe.");
        term.writeln('\x1B[1mfact <ObjectName> "<predicate>"\x1B[0m             - Defines an atomic predicate as true for an object.');
        term.writeln("\x1B[1mquery <ObjectName> <Expression>?\x1B[0m            - Evaluates a complex expression for a specific object.");
        term.writeln("\x1B[1mcheck forall <Expression>?\x1B[0m                  - Evaluates if an expression is true for all objects in the domain.");
        term.writeln("\x1B[1mstate\x1B[0m                                       - Shows the current state of all objects and their facts.");
        term.writeln("\x1B[1mhelp\x1B[0m                                        - Shows this help message.");
        term.writeln("\x1B[1mexit\x1B[0m                                        - Exits the program (closes this terminal).");
        term.writeln("");
        term.writeln("\x1B[1;33m--- Expression Syntax ---\x1B[0m");
        term.writeln("Use parentheses \x1B[1m()\x1B[0m for grouping.");
        term.writeln('Predicates: \x1B[1m"is mortal"\x1B[0m, etc. (use quotes for multi-word predicates).');
        term.writeln("Operators (by precedence): \x1B[1mNOT > AND > OR > RELEVANTLY_IMPLIES\x1B[0m.");
        term.writeln("  \x1B[1mRELEVANTLY_IMPLIES\x1B[0m: A stricter implication that is true if and only if:");
        term.writeln("                     a) The classical condition (!P || Q) is true, AND");
        term.writeln("                     b) P and Q share at least one atomic predicate, AND");
        term.writeln("                     c) The structure is coherent (passes Connexive checks).");
        term.writeln("");
        term.writeln('\x1B[1mExample\x1B[0m: query socrates ( "is human" AND "is greek" ) RELEVANTLY_IMPLIES "is human" ?');
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
                term.writeln("\x1B[1;31mError: Invalid 'domain' command. Use: domain add <ObjectName>\x1B[0m");
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
                term.writeln(`\x1B[1;31mError: Invalid 'fact' command. Use: fact <ObjectName> "<predicate>"\x1B[0m`);
              }
              break;
            case "query": {
              if (parts.length < 3) {
                term.writeln("\x1B[1;31mError: Invalid 'query' command. Use: query <ObjectName> <Expression>?\x1B[0m");
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
              if (parts.length < 3 || parts[1].toLowerCase() !== "forall") {
                term.writeln("\x1B[1;31mError: Invalid 'check' command. Use: check forall <Expression>?\x1B[0m");
                return;
              }
              const exprTokens = parts.slice(2);
              cleanExpressionTokens(exprTokens);
              const expression = ExpressionParser.parse(exprTokens);
              const result = universe.checkForAll(expression);
              term.writeln(`Result for ALL objects: \x1B[1;${result ? "32mTRUE" : "31mFALSE"}\x1B[0m`);
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
        switch (domEvent.keyCode) {
          case 13:
            term.writeln("");
            if (currentLine.trim()) {
              commandHistory.unshift(currentLine);
              handleCommand(currentLine);
            }
            historyIndex = -1;
            currentLine = "";
            term.write(PROMPT_STRING);
            break;
          case 8:
            if (term.buffer.active.cursorX > PROMPT_VISIBLE_LENGTH) {
              currentLine = currentLine.slice(0, -1);
              term.write("\b \b");
            }
            break;
          case 38:
            if (historyIndex < commandHistory.length - 1) {
              historyIndex++;
              term.write("\x1B[2K\r" + PROMPT_STRING);
              currentLine = commandHistory[historyIndex];
              term.write(currentLine);
            }
            break;
          case 40:
            if (historyIndex > 0) {
              historyIndex--;
              term.write("\x1B[2K\r" + PROMPT_STRING);
              currentLine = commandHistory[historyIndex];
              term.write(currentLine);
            } else {
              historyIndex = -1;
              term.write("\x1B[2K\r" + PROMPT_STRING);
              currentLine = "";
            }
            break;
          default:
            if (printable) {
              currentLine += key;
              term.write(key);
            }
        }
      });
    }
  });
  require_main();
})();
