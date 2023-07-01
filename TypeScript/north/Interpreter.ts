import { isInt, assert, Mode } from '../north/Util';
import Dictionary from '../north/Dictionary';
import Memory from '../north/Memory';
import Stack from '../north/Stack';


export default class Interpreter {
    memory: Memory;
    dictionary: Dictionary;
    stack: Stack;

    constructor() {
        this.memory = new Memory();
        this.dictionary = new Dictionary(this.memory);
        this.stack = new Stack();
    }

/*
constructor(dictionary?: Dictionary, stack?: Stack, memory?: Memory) {
this.memory = memory ? memory : new Memory();
this.dictionary = dictionary ? dictionary : new Dictionary(this.memory);
this.stack = stack ? stack : new Stack();
}
*/

    execute_colon_word(address_list: number[]): void {
        const MEM_0_IF = 0;
        const MEM_1_ELSE = 1;
        const MEM_2_THEN = 2;
        for (const address of address_list) {
            const mode: Mode = this.stack.modePeek();
            if ([Mode.IGNORE, Mode.BLOCK].includes(mode) &&
                    ![MEM_0_IF, MEM_1_ELSE, MEM_2_THEN].includes(address)) {
                continue;
            }

            assert(typeof address === 'number', `Executed colon word address: ${address} must be number`);
            const value = this.memory.read(address);
            assert(value !== undefined, `Value at address: ${address} must exist in memory`);

            if (typeof value === 'function') {
                value(this.stack);
            } else if (typeof value === 'number') {
                this.stack.push(value);
            } else if (Array.isArray(value)) {
                this.execute_colon_word(value);
            }
        }
    }

    execute(string_input: string): void {
        if (!string_input || !string_input.trim()) {
            return;
        }
        const tokens = string_input.trim().split(/\s+/);
        for (const token of tokens) {
            const mode: Mode = this.stack.modePeek();
            if (mode === Mode.EXECUTE || (mode=== Mode.COMPILE && token === ';') ||
                    ([Mode.IGNORE, Mode.BLOCK].includes(mode) &&
                        ['IF', 'ELSE', 'THEN'].includes(token))) {
                const action = this.dictionary.getAction(token);
                assert(
                    Array.isArray(action) || isInt(token) || typeof action === 'function',
                    'Tokens are either callable code word, list colon word, or number'
                );
                if (typeof action === 'function') {
                    action(this.stack);
                } else if (Array.isArray(action)) {
                    this.execute_colon_word(action);
                } else if (isInt(token)) {
                    this.stack.push(parseInt(token, 10));
                } else {
                    assert(false, "Unexpected token: " + token +" or type of action: " + action);
                }
            } else if (mode === Mode.COMPILE) {
                this.stack.compile_definition!.push(token);
            } else if (mode === Mode.IGNORE) {
                continue;
            } else {
                assert(
                    false,
                    `Unknown mode state: ${mode} all mode stack: ${this.stack.mode.toString()}`
                );
            }
        }
    }
}
