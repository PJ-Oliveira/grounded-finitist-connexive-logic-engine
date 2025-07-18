// main.ts - Final Stable Version

// These are globals provided by the xterm.js library scripts loaded in index.html
declare const Terminal: any;
declare const FitAddon: any;

// Import logic classes from the project
import { Domain } from './engine/Domain';
import { DomainObject } from './engine/DomainObject';
import { ExpressionParser } from './ui/ExpressionParser';

// --- Terminal Setup ---
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
    },
    // This setting prevents the default browser action for keys like F1, F5, etc.
    // It can sometimes help with input consistency.
    cancelEvents: true 
});
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal')!);
fitAddon.fit();
window.addEventListener('resize', () => fitAddon.fit());

// --- Application Logic ---
const universe = new Domain();
const commandHistory: string[] = [];
let historyIndex = -1;
let currentLine = "";

// --- Helper Functions ---

function printWelcomeMessage() {
    term.writeln("--- Grounded Finitist Connexive Logic Engine (TypeScript/Web Edition) ---");
    term.writeln("Type 'help' for commands or 'exit' to quit.");
    term.writeln("--------------------------------------------------------------------------");
}

function printHelp() {
    term.writeln("");
    term.writeln("\x1b[1;33m--- Core Principles ---\x1b[0m");
    term.writeln("1. \x1b[1mFINITE DOMAIN\x1b[0m: The 'forall' quantifier is ALWAYS restricted to a known set.");
    term.writeln("2. \x1b[1mRELEVANT IMPLICATION\x1b[0m: The system exclusively uses a stricter, multi-layered implication.");
    term.writeln("");
    term.writeln("\x1b[1;33m--- Available Commands ---\x1b[0m");
    term.writeln("\x1b[1mdomain add <ObjectName>\x1b[0m                     - Adds an object to the finite universe.");
    term.writeln("\x1b[1mfact <ObjectName> \"<predicate>\"\x1b[0m             - Defines an atomic predicate as true for an object.");
    term.writeln("\x1b[1mquery <ObjectName> <Expression>?\x1b[0m            - Evaluates a complex expression for a specific object.");
    term.writeln("\x1b[1mcheck forall <Expression>?\x1b[0m                  - Evaluates if an expression is true for all objects in the domain.");
    term.writeln("\x1b[1mstate\x1b[0m                                       - Shows the current state of all objects and their facts.");
    term.writeln("\x1b[1mhelp\x1b[0m                                        - Shows this help message.");
    term.writeln("\x1b[1mexit\x1b[0m                                        - Exits the program (closes this terminal).");
    term.writeln("\x1b[1mclear\x1b[0m                                       - Clears the terminal screen.");
    term.writeln("");
    term.writeln("\x1b[1;33m--- Expression Syntax ---\x1b[0m");
    term.writeln("Use parentheses \x1b[1m()\x1b[0m for grouping.");
    term.writeln("Predicates: \x1b[1m\"is mortal\"\x1b[0m, etc. (use quotes for multi-word predicates).");
    term.writeln("Operators (by precedence): \x1b[1mNOT > AND > OR > RELEVANTLY_IMPLIES\x1b[0m.");
    term.writeln("  \x1b[1mRELEVANTLY_IMPLIES\x1b[0m: A stricter implication.");
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

// --- Terminal Input Logic ---
printWelcomeMessage();
term.write(PROMPT_STRING);

const PROMPT_VISIBLE_LENGTH = PROMPT_STRING.replace(/[\u001b\u009b][[()#;?]?[0-9]{1,4}(?:;[0-9]{0,4})*[0-9A-ORZcf-nqry=><]/g, '').length;

// FINAL ROBUST IMPLEMENTATION:
// Use a single `onKey` handler and inspect the event to decide the action.
// This avoids race conditions between onData and onKey.
term.onKey(({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
    
    // Use `domEvent.key` as it's the most reliable source.
    const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

    if (domEvent.key === 'Enter') {
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

    } else if (domEvent.key === 'Backspace') {
        if (term.buffer.active.cursorX > PROMPT_VISIBLE_LENGTH) {
            currentLine = currentLine.slice(0, -1);
            term.write('\b \b');
        }
    } else if (domEvent.key === 'ArrowUp') {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            const clearLine = '\x1b[2K\r' + PROMPT_STRING;
            term.write(clearLine);
            currentLine = commandHistory[historyIndex];
            term.write(currentLine);
        }
    } else if (domEvent.key === 'ArrowDown') {
        if (historyIndex > 0) {
            historyIndex--;
            const clearLine = '\x1b[2K\r' + PROMPT_STRING;
            term.write(clearLine);
            currentLine = commandHistory[historyIndex];
            term.write(currentLine);
        } else {
            historyIndex = -1;
            const clearLine = '\x1b[2K\r' + PROMPT_STRING;
            term.write(clearLine);
            currentLine = "";
        }
    } else if (printable && domEvent.key.length === 1) {
        // This is a normal character, including spaces and quotes.
        currentLine += domEvent.key;
        term.write(domEvent.key);
    }
});