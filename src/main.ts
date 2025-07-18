// main.ts

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
    }
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
    term.writeln("  \x1b[1mRELEVANTLY_IMPLIES\x1b[0m: A stricter implication that is true if and only if:");
    term.writeln("                     a) The classical condition (!P || Q) is true, AND");
    term.writeln("                     b) P and Q share at least one atomic predicate (relevance), AND");
    term.writeln("                     c) The structure is coherent (passes Connexive checks).");
    term.writeln("");
    term.writeln("\x1b[1mExample\x1b[0m: query socrates ( \"is human\" AND \"is greek\" ) RELEVANTLY_IMPLIES \"is human\" ?");
    term.writeln("--------------------------------------------------------------------------");
}

/**
 * Parses a command line string into tokens. Handles quoted strings.
 * @param input The raw string from the command line.
 * @returns An array of string tokens.
 */
function parseCommandLine(input: string): string[] {
    const tokens: string[] = [];
    // This regex matches either a sequence of non-space characters
    // or a sequence of any characters enclosed in double quotes.
    const regex = /"([^"]*)"|\S+/g;
    let match;
    while ((match = regex.exec(input)) !== null) {
        // match[1] is the content inside quotes, match[0] is the full token.
        tokens.push(match[1] || match[0]);
    }
    return tokens;
}

/**
 * Removes a trailing question mark from the last token in an array.
 * @param tokens The array of expression tokens.
 */
function cleanExpressionTokens(tokens: string[]): void {
    if (tokens.length === 0) return;

    const lastIndex = tokens.length - 1;
    const lastToken = tokens[lastIndex];

    if (lastToken.endsWith('?')) {
        const cleanedToken = lastToken.slice(0, -1);
        if (cleanedToken) {
            tokens[lastIndex] = cleanedToken;
        } else {
            // If the token was just "?", remove it entirely.
            tokens.pop();
        }
    }
}

/**
 * Main command handler. Parses the line and executes the corresponding action.
 * @param line The command line string to process.
 */
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

// REFACTORED INPUT HANDLING:
// This new structure robustly handles typing, dead keys, and pasting.

// Buffer for the current command line
let currentLine = "";

// Regex to remove ANSI color codes and calculate the visible length of the prompt
const PROMPT_VISIBLE_LENGTH = PROMPT_STRING.replace(/[\u001b\u009b][[()#;?]?[0-9]{1,4}(?:;[0-9]{0,4})*[0-9A-ORZcf-nqry=><]/g, '').length;

// 1. `onData` handles ALL text input (typing, pasting, etc.)
// This is the robust way to handle user input, as it correctly processes
// character composition (like dead keys for quotes) and pasted text.
term.onData((data: string) => {
    currentLine += data; // Append the received data to our internal buffer
    term.write(data);   // Write the same data to the terminal for the user to see
});

// 2. `onKey` now ONLY handles special, non-printable control keys.
term.onKey(({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {

    switch (key) {
        case 'Enter':
            term.writeln("");
            if (currentLine.trim()) {
                // Prevents adding consecutive duplicate commands to history
                if (commandHistory[0] !== currentLine) {
                    commandHistory.unshift(currentLine);
                }
                handleCommand(currentLine);
            }
            historyIndex = -1;
            currentLine = "";
            term.write(PROMPT_STRING);
            break;

        case 'Backspace':
            // Only erase if the cursor is not at the start of the prompt
            if (term.buffer.active.cursorX > PROMPT_VISIBLE_LENGTH) {
                currentLine = currentLine.slice(0, -1);
                term.write('\b \b'); // Move cursor back, write a space, move back again
            }
            break;

        case 'ArrowUp':
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                const clearLine = '\x1b[2K\r' + PROMPT_STRING; // ANSI code to clear line and move to start
                term.write(clearLine);
                currentLine = commandHistory[historyIndex];
                term.write(currentLine);
            }
            break;

        case 'ArrowDown':
            if (historyIndex > 0) {
                historyIndex--;
                const clearLine = '\x1b[2K\r' + PROMPT_STRING;
                term.write(clearLine);
                currentLine = commandHistory[historyIndex];
                term.write(currentLine);
            } else {
                // If we're at the bottom of history, clear the line
                historyIndex = -1;
                const clearLine = '\x1b[2K\r' + PROMPT_STRING;
                term.write(clearLine);
                currentLine = "";
            }
            break;

        // Left and right arrows don't need custom logic here,
        // as we are not implementing mid-line editing.
        // We intentionally do nothing to prevent them from printing text.
        case 'ArrowLeft':
        case 'ArrowRight':
            // Intentionally do nothing
            break;
    }
});