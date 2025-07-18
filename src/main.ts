declare const Terminal: any;
declare const FitAddon: any;

// Importar as nossas classes de lógica
import { Domain } from './engine/Domain';
import { DomainObject } from './engine/DomainObject';
import { ExpressionParser } from './ui/ExpressionParser';

// --- Configuração do Terminal ---
const PROMPT_STRING = '\x1b[1;32mlogic>\x1b[0m ';
const term = new Terminal({
    cursorBlink: true,
    fontFamily: "'Fira Code', monospace",
    fontSize: 14,
    theme: {
        background: '#1e1e1e',
        foreground: '#e0e0e0',
        cursor: '#e0e0e0',
        selectionBackground: '#555'
    }
});
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal')!);
fitAddon.fit();
window.addEventListener('resize', () => fitAddon.fit());

// --- Lógica da Aplicação ---
const universe = new Domain();
const commandHistory: string[] = [];
let historyIndex = -1;
let currentLine = "";

// --- Funções de Ajuda ---

function printWelcomeMessage() {
    term.writeln("--- Grounded Finitist Connexive Logic Engine (TypeScript/Web Edition) ---");
    term.writeln("Type 'help' for commands or 'exit' to quit.");
    term.writeln("--------------------------------------------------------------------------");
}

function printHelp() {
    term.writeln("");
    term.writeln("\x1b[1;33m--- Core Principles ---\x1b[0m");
    term.writeln("1. \x1b[1mFINITE DOMAIN\x1b[0m: The 'forall' quantifier is ALWAYS restricted.");
    term.writeln("2. \x1b[1mMULTI-LAYERED IMPLICATION\x1b[0m: The system exclusively uses a stricter, multi-layered implication.");
    term.writeln("");
    term.writeln("\x1b[1;33m--- Available Commands ---\x1b[0m");
    term.writeln("\x1b[1mdomain add <ObjectName>\x1b[0m                     - Adds an object to the finite universe.");
    term.writeln("\x1b[1mfact <ObjectName> \"<predicate>\"\x1b[0m             - Defines an atomic predicate as true for an object.");
    term.writeln("\x1b[1mquery <ObjectName> <Expression>?\x1b[0m            - Evaluates a complex expression for a specific object.");
    term.writeln("\x1b[1mcheck forall <Expression>?\x1b[0m                  - Evaluates if an expression is true for all objects in the domain.");
    term.writeln("\x1b[1mstate\x1b[0m                                       - Shows the current state of all objects and their facts.");
    term.writeln("\x1b[1mhelp\x1b[0m                                        - Shows this help message.");
    term.writeln("\x1b[1mexit\x1b[0m                                        - Exits the program (closes this terminal).");
    term.writeln("");
    term.writeln("\x1b[1;33m--- Expression Syntax ---\x1b[0m");
    term.writeln("Use parentheses \x1b[1m()\x1b[0m for grouping.");
    term.writeln("Predicates: \x1b[1m\"is mortal\"\x1b[0m, etc. (use quotes for multi-word predicates).");
    term.writeln("Operators (by precedence): \x1b[1mNOT > AND > OR > RELEVANTLY_IMPLIES\x1b[0m.");
    term.writeln("  \x1b[1mRELEVANTLY_IMPLIES\x1b[0m: A stricter implication that is true if and only if:");
    term.writeln("                     a) The classical condition (!P || Q) is true, AND");
    term.writeln("                     b) P and Q share at least one atomic predicate, AND");
    term.writeln("                     c) The structure is coherent (passes Connexive checks).");
    term.writeln("");
    term.writeln("\x1b[1mExample\x1b[0m: query socrates ( \"is human\" AND \"is greek\" ) RELEVANTLY_IMPLIES \"is human\" ?");
    term.writeln("--------------------------------------------------------------------------");
}

function parseCommandLine(input: string): string[] {
    const tokens: string[] = [];
    const regex = /"([^"]*)"|\S+/g;
    let match;
    while ((match = regex.exec(input)) !== null) {
        tokens.push(match[1] || match[0]);
    }
    return tokens;
}

function cleanExpressionTokens(tokens: string[]): void {
    if (tokens.length === 0) return;
    const lastIndex = tokens.length - 1;
    const lastToken = tokens[lastIndex];
    if (lastToken.endsWith('?')) {
        const cleanedToken = lastToken.slice(0, -1);
        if (cleanedToken) {
            tokens[lastIndex] = cleanedToken;
        } else {
            tokens.pop();
        }
    }
}

function handleCommand(line: string): void {
    const parts = parseCommandLine(line);
    if (parts.length === 0) {
        return;
    }

    const command = parts[0].toLowerCase();
    try {
        switch (command) {
            case 'domain':
                if (parts.length === 3 && parts[1].toLowerCase() === 'add') {
                    universe.addObject(new DomainObject(parts[2]));
                    term.writeln(`Object '${parts[2]}' added to the domain.`);
                } else {
                    term.writeln("\x1b[1;31mError: Invalid 'domain' command. Use: domain add <ObjectName>\x1b[0m");
                }
                break;
            case 'fact':
                if (parts.length === 3) {
                    const obj = universe.getObject(parts[1]);
                    if (obj) {
                        obj.setPredicateState(parts[2], true);
                        term.writeln(`Fact defined: ${obj.name} -> '${parts[2]}' is true.`);
                    } else {
                        term.writeln(`\x1b[1;31mError: Object '${parts[1]}' not found.\x1b[0m`);
                    }
                } else {
                    term.writeln("\x1b[1;31mError: Invalid 'fact' command. Use: fact <ObjectName> \"<predicate>\"\x1b[0m");
                }
                break;
            case 'query': {
                if (parts.length < 3) {
                    term.writeln("\x1b[1;31mError: Invalid 'query' command. Use: query <ObjectName> <Expression>?\x1b[0m");
                    return;
                }
                const obj = universe.getObject(parts[1]);
                if (obj) {
                    const exprTokens = parts.slice(2);
                    cleanExpressionTokens(exprTokens);
                    const expression = ExpressionParser.parse(exprTokens);
                    const result = expression.evaluate(obj);
                    term.writeln("");
                    term.writeln("\x1b[1;36m==================== QUERY RESULT ====================\x1b[0m");
                    term.writeln(`\x1b[1mExpression:\x1b[0m ${expression.toTreeString()}`);
                    term.writeln(`\x1b[1mFor Object:\x1b[0m ${obj.name}`);
                    term.writeln(`\x1b[1mFinal Result:\x1b[0m \x1b[1;${result.value ? '32mTRUE' : '31mFALSE'}\x1b[0m`);
                    term.writeln("\x1b[1;36m-------------------- Derivation --------------------\x1b[0m");
                    term.writeln(result.explanation);
                    term.writeln("\x1b[1;36m====================================================\x1b[0m");
                } else {
                    term.writeln(`\x1b[1;31mError: Object '${parts[1]}' not found.\x1b[0m`);
                }
                break;
            }
            case 'check': {
                if (parts.length < 3 || parts[1].toLowerCase() !== 'forall') {
                    term.writeln("\x1b[1;31mError: Invalid 'check' command. Use: check forall <Expression>?\x1b[0m");
                    return;
                }
                const exprTokens = parts.slice(2);
                cleanExpressionTokens(exprTokens);
                const expression = ExpressionParser.parse(exprTokens);
                const result = universe.checkForAll(expression);
                term.writeln(`Result for ALL objects: \x1b[1;${result ? '32mTRUE' : '31mFALSE'}\x1b[0m`);
                break;
            }
            case 'state':
                term.writeln(universe.toString());
                break;
            case 'help':
                printHelp();
                break;
            case 'exit':
                term.writeln("Goodbye!");
                setTimeout(() => window.close(), 1000);
                break;
            case 'clear':
                term.clear();
                break;
            default:
                term.writeln(`\x1b[1;31mUnknown command: '${command}'. Type 'help' for a list of commands.\x1b[0m`);
        }
    } catch (e: any) {
        term.writeln(`\x1b[1;31mError: ${e.message}\x1b[0m`);
    }
}

// --- Lógica de Input do Terminal ---
printWelcomeMessage();
term.write(PROMPT_STRING);

// CORREÇÃO: Calculamos o comprimento VISÍVEL do prompt para a lógica do backspace.
// Esta regex remove todos os códigos de cor ANSI.
const PROMPT_VISIBLE_LENGTH = PROMPT_STRING.replace(/[\u001b\u009b][[()#;?]?[0-9]{1,4}(?:;[0-9]{0,4})*[0-9A-ORZcf-nqry=><]/g, '').length;

term.onKey(({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
    const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

    switch (domEvent.keyCode) {
        case 13: // Enter
            term.writeln("");
            if (currentLine.trim()) {
                commandHistory.unshift(currentLine);
                handleCommand(currentLine);
            }
            historyIndex = -1;
            currentLine = "";
            term.write(PROMPT_STRING);
            break;
        case 8: // Backspace
            // CORREÇÃO: Usamos o comprimento visível para a verificação.
            if (term.buffer.active.cursorX > PROMPT_VISIBLE_LENGTH) {
                currentLine = currentLine.slice(0, -1);
                term.write('\b \b'); // Apaga o caractere no terminal
            }
            break;
        case 38: // Arrow Up
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                term.write('\x1b[2K\r' + PROMPT_STRING); // Limpa a linha e volta ao início
                currentLine = commandHistory[historyIndex];
                term.write(currentLine);
            }
            break;
        case 40: // Arrow Down
            if (historyIndex > 0) {
                historyIndex--;
                term.write('\x1b[2K\r' + PROMPT_STRING);
                currentLine = commandHistory[historyIndex];
                term.write(currentLine);
            } else {
                historyIndex = -1;
                term.write('\x1b[2K\r' + PROMPT_STRING);
                currentLine = "";
            }
            break;
        default:
            if (printable && key.length === 1) {
                currentLine += key;
                term.write(key);
            }
    }
});