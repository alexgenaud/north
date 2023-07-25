import { isInt, assert, Mode } from "../north/Util";
import Data from "../north/Data";
import Dictionary from "../north/Dictionary";
import Memory from "../north/Memory";
import Stack from "../north/Stack";
import { DataBlock } from "./types";

const CONDITIONAL_IGNORE_MODES = [Mode.IGNORE, Mode.BLOCK];
export default class Machine {
    dictionary: Dictionary;
    private memory: Memory;
    opstack: Stack;
    costack: Stack;
    compile_definition: (number | string)[] | null;
    compile_word_name: string | null;

    constructor() {
        this.memory = new Memory(128);
        this.dictionary = new Dictionary(this);
        this.opstack = new Stack();
        this.costack = new Stack();
        this.costack.push(Mode.EXECUTE);
        this.compile_definition = null;
        this.compile_word_name = null;
    }

    load(wordLoaders: ((m: Machine) => boolean)[]) {
        let allSuccess: boolean = (wordLoaders && wordLoaders.length > 0);
        wordLoaders.forEach((loader) => {
            const success = loader(this);
            if (!success) allSuccess = false;
        })
        return allSuccess;
    }

    executeInputBuffer(input: string) {
        const tokens = input.trim().split(/\s+/);
        for (const token of tokens) {
            this.execute(token);
        }
    }

    write(data: Data, address?: number): number {
        const newAddress = this.memory.write(data, address);
        if (address != null && address > 0 && address != newAddress) {
            throw new Error("Suggested address must match actual set address");
        }
        return newAddress;
    }

    overwrite(newValue: number, address: number): number {
        return this.memory.overwrite(newValue, address);
    }

    read(address: number): Data {
        return this.memory.read(address);
    }

    dump(): DataBlock[] {
        const start = performance.now();
        const ret: DataBlock[] = this.memory.dump();
        const end = performance.now();
        console.log("dump in " + (end - start) + " ms");
        return ret;
    }

    opStackString(): string {
        return this.opstack.toString();
    }

    coStackString(): string {
        return this.costack.toString();
    }

    execute_colon_word(address_list: number[]): void {
        for (const address of address_list) {
            assert(
                typeof address === "number",
                `Executed colon word address: ${address} must be number`
            );
            const data: Data = this.memory.read(address);
            assert(
                data != null && data instanceof Data,
                `Data at address: ${address} must exist in memory`
            );
            assert(
                data.getValue() != null,
                `Data at address: ${address} exists but has no value`
            );

            const value = data.getValue();
            const mode: Mode = this.costack.peek();
            if (
                CONDITIONAL_IGNORE_MODES.includes(mode) &&
                !data.isConditionFunc()
            ) {
                continue;
            }

            if (data.isFunc() && typeof value === "function") {
                value(this);
            } else if (data.isInt() && typeof value === "number") {
                this.opstack.push(value);
            } else if (data.isStr() && typeof value === "string") {
                this.opstack.push(value);
            } else if (data.isColonFunc() && Array.isArray(value)) {
                this.execute_colon_word(value);
            } else {
                throw new Error(
                    `Unknown type: ${typeof value} of value: ${value}`
                );
            }
        }
    }

    execute(token: string): void {
        if (token == null || (typeof token === "string" && token.length < 1)) {
            return;
        }
        const parser: number = this.dictionary.getAction("PARSER");
        const parserAdr: number = this.dictionary.getWordAddress("PARSER");
        console.log("parser: " + JSON.stringify(parser) +" at address: " + parserAdr);
        // TODO: call Parser (interpret, compile, etc)
        // based on PARSER memory data value,
        // which will point to a core word

        const mode: Mode = this.costack.peek();
        const data: Data | null = this.dictionary.getAction(token);
        if (
            mode === Mode.EXECUTE ||
            (mode === Mode.COMPILE &&
                data !== null &&
                data.isImmediateFunc()) ||
            (CONDITIONAL_IGNORE_MODES.includes(mode) &&
                data !== null &&
                data.isConditionFunc())
        ) {
            if (data == null) {
                if (isInt(token)) {
                    this.opstack.push(parseInt(token, 10));
                } else if (typeof token === "string") {
                    this.opstack.push(token);
                } else {
                    throw new Error(
                        `Unexpected token: ${token} and action: null`
                    );
                }
                return;
            }
            const value = data.getValue();
            if (value == null) {
                throw new Error(
                    `Null action.value of token: ${token}. Action data: ${data}`
                );
            }

            if (data.isCoreFunc() && typeof value === "function") {
                value(this);
            } else if (data.isColonFunc() && Array.isArray(value)) {
                this.execute_colon_word(value);
            } else if (data.isInt() && isInt(value)) {
                this.opstack.push(value as number);
            } else if (data.isFloat() && typeof value === "number") {
                this.opstack.push(value as number);
            } else if (data.isStr() && typeof value === "string") {
                this.opstack.push(value as string);
            } else {
                throw new Error(
                    "Unexpected token: " +
                        token +
                        " or type of action data value: " +
                        value
                );
            }
            return;
        } else if (mode === Mode.COMPILE) {
            if (this.compile_definition == null) {
                throw new Error(
                    "Compiled definition must not be null while in COMPILE mode"
                );
            }
            this.compile_definition.push(token);

            /* TODO set addresses in memory while reading tokens
            if (this.compile_word_name === null) {
                this.compile_word_name = token;
                return;
            }
            this.addWordColonName
            */
        } else if (mode === Mode.CONSTANT) {
            this.opstack.push(token);
            this.dictionary.constInitWord(this);
        } else if (mode === Mode.VARIABLE) {
            this.opstack.push(token);
            this.dictionary.varInitWord(this);
        } else if (CONDITIONAL_IGNORE_MODES.includes(mode)) {
            return;
        } else {
            throw new Error(
                `Unknown mode state: ${mode} all mode stack: ${this.costack.toString()}`
            );
        }
    }
}
