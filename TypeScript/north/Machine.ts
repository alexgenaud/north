import { isInt, assert, Mode } from '../north/Util';
import Data from '../north/Data';
import Dictionary from '../north/Dictionary';
import Memory from '../north/Memory';
import Stack from '../north/Stack';


const CONDITIONAL_IGNORE_MODES = [Mode.IGNORE, Mode.BLOCK];
export default class Machine {
    dictionary: Dictionary;
    private memory: Memory;
    opstack: Stack;
    costack: Stack;
    compile_definition: any[] | null;

    constructor() {
        this.memory = new Memory(64);
        this.dictionary = new Dictionary(this);
        this.opstack = new Stack();
        this.costack = new Stack();
        this.costack.push(Mode.EXECUTE);
        this.compile_definition = null;
    }

    write(data: Data, address?: number): number {
        return this.memory.write(data, address);
    }

    read(address: number): Data {
        return this.memory.read(address);
    }

    execute_colon_word(address_list: number[]): void {
        for (const address of address_list) {
            assert(typeof address === 'number',
                    `Executed colon word address: ${address} must be number`);
            const data: Data = this.memory.read(address);
            assert(data != null && data instanceof Data,
                    `Data at address: ${address} must exist in memory`);
            assert(data.value != null,
                    `Data at address: ${address} exists but has no value`);

            const mode: Mode = this.costack.peek();
            if (CONDITIONAL_IGNORE_MODES.includes(mode) && !data.is_fn_condition) {
                continue;
            }

            if (data.is_fn_core && typeof data.value === 'function') {
                data.value(this);
            } else if (data.is_integer && typeof data.value === 'number') {
                this.opstack.push(data.value);
            } else if (data.is_string && typeof data.value === 'string') {
                this.opstack.push(data.value);
            } else if (data.is_fn_colon_array && Array.isArray(data.value)) {
                this.execute_colon_word(data.value);
            } else {
                throw new Error(`Unknown type: ${ typeof data.value } of value: ${data.value}`);
            }
        }
    }

    execute(token: string): void {
        if (token == null || (typeof token === 'string' && token.length < 1)) {
            return;
        }
        assert(token != null, "Token must not be null")
        const mode: Mode = this.costack.peek();
        const action: Data | null = this.dictionary.getAction(token);
        if (mode === Mode.EXECUTE ||
                (mode === Mode.COMPILE && action !== null
                        && action.is_fn_immediate) ||
                (CONDITIONAL_IGNORE_MODES.includes(mode) && action !== null
                        && action.is_fn_condition)) {
            if (action == null) {
                if (isInt(token)) this.opstack.push(parseInt(token, 10));
                else if (typeof token === 'string') this.opstack.push(token);
                else throw new Error(`Unexpected token: ${token} and action: null`);
            } else if (action.value == null) {
                throw new Error(`Null action.value of token: ${token}. Action: ${action}`);
            } else if (action.is_fn_core && typeof action.value === 'function') {
                action.value(this);
            } else if (action.is_fn_colon_array && Array.isArray(action.value)) {
                this.execute_colon_word(action.value);
            } else if (action.is_integer && isInt(action.value)) {
                this.opstack.push(action.value as number);
            } else if (action.is_string && typeof action.value === 'string') {
                this.opstack.push(action.value);
            } else {
                throw new Error("Unexpected token: " + token
                        + " or type of action: " + action.value );
            }
        } else if (mode === Mode.COMPILE) {
            if (this.compile_definition == null) {
                throw new Error("Compiled definition must not be null while in COMPILE mode");
            }
            this.compile_definition.push(token);
        } else if (mode === Mode.CONSTANT) {
            this.opstack.push(token);
            this.dictionary.constInitWord(this);
        } else if (mode === Mode.VARIABLE) {
            this.opstack.push(token);
            this.dictionary.varInitWord(this)
        } else if (CONDITIONAL_IGNORE_MODES.includes(mode)) {
            return;
        } else {
            throw new Error(`Unknown mode state: ${mode} all mode stack: ${this.costack.toString()}`);
        }
    }
}
