import { isInt, assert, Mode } from '../north/Util';
import Dictionary from '../north/Dictionary';
import Memory from '../north/Memory';
import Stack from '../north/Stack';


const CONDITIONAL_WORDS_IN_MEMORY = [3, 4, 5];  /* IF , ELSE , THEN */
const CONDITIONAL_WORDS = ['IF', 'ELSE', 'THEN'];
const CONDITIONAL_IGNORE_MODES = [Mode.IGNORE, Mode.BLOCK];
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
        for (const address of address_list) {
            const mode: Mode = this.stack.modePeek();
            if (CONDITIONAL_IGNORE_MODES.includes(mode) &&
                    !CONDITIONAL_WORDS_IN_MEMORY.includes(address)) {
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
            } else {
                throw new Error(`Unknown type: ${ typeof(value) } of value: ${value}`);
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
            if (mode === Mode.EXECUTE ||
                    (mode=== Mode.COMPILE && token === ';') ||
                    (CONDITIONAL_IGNORE_MODES.includes(mode) && CONDITIONAL_WORDS.includes(token))
            ) {
                const action = this.dictionary.getAction(token);
                if (typeof action === 'function') {
                    action(this.stack);
                } else if (Array.isArray(action)) {
                    this.execute_colon_word(action);
                } else if (action != null) {
                    this.stack.push(action);
                } else if (isInt(token)) {
                    this.stack.push(parseInt(token, 10));
                } else if (typeof token === 'string') {
                    this.stack.push(token);
                } else {
                    throw new Error("Unexpected token: ${token} or type of action: ${action}");
                }
            } else if (mode === Mode.COMPILE) {
                this.stack.compile_definition!.push(token);
            } else if (mode === Mode.CONSTANT) {
                this.stack.push(token);
                this.dictionary.constInitWord(this.stack)
            } else if (mode === Mode.VARIABLE) {
                this.stack.push(token);
                this.dictionary.varInitWord(this.stack)
            } else if (CONDITIONAL_IGNORE_MODES.includes(mode)) {
                continue;
            } else {
                throw new Error(`Unknown mode state: ${mode} all mode stack: ${this.stack.mode.toString()}`);
            }
        }
    }
}
