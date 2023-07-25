import { isInt, Mode, assert } from "../north/Util";
import Machine from "../north/Machine";
import Data from "../north/Data";
import { DataType, getTypeStr } from "./types";

export default class Dictionary {
    private core: { [word: string]: number[] };
    private machine: Machine;

    constructor(machine: Machine) {
        this.core = {};
        this.machine = machine;
        this.loadCoreWords();
    }

    public addCoreCondition(
        word: string,
        action: (m: Machine) => void
    ): number {
        return this.addWordData(word, new Data(action, DataType.f_c, word));
    }

    public addCoreImmediate(
        word: string,
        action: (m: Machine) => void
    ): number {
        return this.addWordData(word, new Data(action, DataType.f_i, word));
    }

    public addCoreFunc(
        word: string,
        action: (m: Machine) => void
    ): number {
        return this.addWordData(word, new Data(action, DataType.f_n, word));
    }

    public addI8(word: string, action: number): number {
        return this.addWordData(word, new Data(action, DataType.i8));
    }

    public addI16(word: string, action: number): number {
        return this.addWordData(word, new Data(action, DataType.i16));
    }

    public addNumber(word: string, action: number): number {
        return this.addWordData(word, new Data(action)); // type to be determined
    }

    public addPointer(
        word: string,
        value: number,
        refType: DataType
    ): number {
        const addressOfValue = this.machine.write(
            new Data(value, refType)
        );
        const ptrType = "* " + getTypeStr(refType);
        return this.addWordData(
            word,
            new Data(addressOfValue, DataType.i16, ptrType)
        );
    }

    public addWordData(word: string, data: Data): number {
        if (!this.core[word]) {
            this.core[word] = [];
        }
        const address = this.machine.write(data);
        this.core[word].push(address);
        return address;
    }

    public addColonArray(
        word: string,
        addressArray: number[]
    ): number {
        const dataHeader: Data = new Data(addressArray, DataType.c_n, word);
        const addressHeader = this.addWordData(word, dataHeader);
        let addressLocation = addressHeader + 1;
        for (const i16address of addressArray) {
            this.machine.write( new Data(i16address, DataType.i16), addressLocation);
            addressLocation += 2;
        }
        return addressHeader;
    }

    /** looks word up in dictionary. Return null if not found.
     *  If dictionary word found, expect a list of memory addresses in dictionary.
     *  return the value at the latest memory address.
     */
    public getAction(word: string): Data | null {
        if (!(typeof word === "string" && word.length > 0)) {
            throw new Error("Dictionary word must be a non-empty string");
        }
        const actionList = this.core[word];
        const address = actionList ? actionList[actionList.length - 1] : null;
        const result = address != null ? this.machine.read(address) : null;
        return result;
    }

    public getWordAddress(word: string): number | null {
        if (!(typeof word === "string" && word.length > 0)) {
            throw new Error("Dictionary word must be a non-empty string");
        }
        const actionList = this.core[word];
        return actionList ? actionList[actionList.length - 1] : null;
    }

    private divideInt(m: Machine): void {
        const a = m.opstack.pop() as number;
        if (typeof a !== "number" || a === 0) {
            throw new Error(`Divisor must be non-zero int. Was ${a}`);
        }
        const b = m.opstack.pop() as number;
        if (typeof b !== "number") {
            throw new Error(`Numerator must be a number. Was ${b}`);
        }
        m.opstack.push(Math.floor(b / a));
    }

    private mod(m: Machine): void {
        let d = m.opstack.pop() as number;
        assert(
            typeof d === "number" && isInt(d) && d !== 0,
            "Modulo divisor must be non-zero number. Was ${d}"
        );
        if (d < 0) d = -d;
        let n = m.opstack.pop() as number;
        assert(
            typeof n === "number" && isInt(n),
            "Modulo numerator must be a number. Was ${n}"
        );
        if (n < 0) n += d * n * -1;
        m.opstack.push((n % d) + 0); // -0 is possible ! :o
    }

    private compileStart(m: Machine): void {
        assert(
            m.costack.peek() === Mode.EXECUTE && m.compile_definition === null,
            "Start compilation from EXECUTE mode with no definition list"
        );
        m.costack.push(Mode.COMPILE);
        m.compile_definition = [];
        m.compile_word_name = null;
    }

    private compileEnd(dictionary: Dictionary): (m: Machine) => void {
        const getWordAddress = dictionary.getWordAddress.bind(dictionary);
        return (m: Machine) => {
            if (
                m.costack.peek() !== Mode.COMPILE ||
                m.compile_definition == null ||
                !Array.isArray(m.compile_definition)
            ) {
                throw new Error(
                    `Must end compilation in COMPILE mode: ${m.costack.peek()} with definition list: ${
                        m.compile_definition
                    }`
                );
            }
            const wordName = m.compile_definition.shift();
            const addressList: number[] = [];
            for (const token of m.compile_definition) {
                if (!(typeof token === "string" && token.length > 0)) {
                    throw new Error(
                        "Compiled colon word must contain non-empty numbers or words"
                    );
                }
                const address = getWordAddress(token);
                if (address === null && isInt(token)) {
                    //const newAddress = this.addWordI8(token, parseInt(token, 10));
                    const newAddress = this.addI8(
                        token,
                        parseInt(token, 10)
                    );
                    addressList.push(newAddress);
                    continue;
                }
                if (typeof address !== "number") {
                    throw new Error("Extant action must have number address");
                }
                const data = this.getAction(token);
                if (data == null || data.getValue() == null) {
                    throw new Error(
                        `Defined word: ${token} with address: ${address} must have data`
                    );
                }
                const value = data.getValue();
                if (
                    typeof value !== "number" &&
                    !Array.isArray(value) &&
                    typeof value !== "function"
                ) {
                    throw new Error(
                        `Word ${token} action must be a number, an array, or a function`
                    );
                }
                if (data.isCoreFunc() && typeof value === "function") {
                    addressList.push(address);
                } else if (data.isInt() && typeof value === "number") {
                    addressList.push(address);
                } else if (data.isStr() && typeof value === "string") {
                    addressList.push(address);
                } else if (data.isColonFunc() && Array.isArray(value)) {
                    addressList.push(...value); // INLINE
                } else {
                    throw new Error(
                        `Unexpected data: ${data} at address: ${address} of word: ${token}`
                    );
                }
            }
            this.addColonArray(
                wordName as string,
                addressList
            ); // returns address, ignored
            m.compile_definition = null;
            m.costack.pop();
            if (m.costack.peek() !== Mode.EXECUTE) {
                throw new Error(
                    "Expected to pop out of COMPILE into EXECUTE mode"
                );
            }
        };
    }

    private conditionIf(m: Machine): void {
        const current = m.costack.peek();
        if (current === Mode.IGNORE || current === Mode.BLOCK) {
            m.costack.push(Mode.BLOCK);
        } else if (current === Mode.COMPILE) {
            m.costack.push(Mode.COMPILE);
        } else if (current === Mode.EXECUTE) {
            m.costack.push(m.opstack.pop() !== 0 ? Mode.EXECUTE : Mode.IGNORE);
        }
    }

    private conditionElse(m: Machine): void {
        const current = m.costack.peek();
        if (current === Mode.IGNORE) {
            m.costack.toggle(Mode.EXECUTE);
        } else if (current === Mode.EXECUTE) {
            m.costack.toggle(Mode.IGNORE);
        }
    }

    private conditionThen(m: Machine): void {
        if (m.costack.peek() === Mode.COMPILE) {
            throw new Error(
                "Executed condition must be from EXECUTE or IGNORE but not COMPILE mode"
            );
        }
        m.costack.pop(); // if EXECUTE else IGNORE else EXECUTE
    }

    // 220 CONSTANT LIMIT
    // The word LIMIT returns its value not its address
    private constInitMode(m: Machine): void {
        assert(
            m.costack.peek() === Mode.EXECUTE,
            "constInit expects to be in EXECUTE Mode. But was: ${m.costack.peek()}"
        );
        m.costack.toggle(Mode.CONSTANT);
    }

    public constInitWord(m: Machine): void {
        assert(
            m.costack.peek() === Mode.CONSTANT,
            "constInit expects to be in CONSTANT Mode. But was: ${m.costack.peek()}"
        );
        assert(
            m.opstack.length > 1,
            "m.opstack must have at least two elements to pop. Has only ${m.opstack.length}"
        );
        this.addNumber(m.opstack.pop(), m.opstack.pop()); // name, early value
        m.costack.toggle(Mode.EXECUTE);
    }

    // VAR myVar
    private varInitMode(m: Machine): void {
        assert(
            m.costack.peek() === Mode.EXECUTE,
            "varInit expects to be in EXECUTE Mode. But was: ${m.costack.peek()}"
        );
        m.costack.toggle(Mode.VARIABLE);
    }

    // VAR (name)
    // sets value 0 at new address A
    // sets address of A at new addess B
    // associates dictionary[name] = address of B
    // dictionary.lookup(name) returns (address A) (value at address B)
    // TODO define var as the address of a CONST
    public varInitWord(m: Machine): void {
        assert(
            m.costack.peek() === Mode.VARIABLE,
            `varInit expects to be in VARIABLE Mode. But was: ${m.costack.peek()}`
        );
        this.addPointer(m.opstack.pop(), 0, DataType.f64);
        m.costack.toggle(Mode.EXECUTE);
    }

    // ! takes the address of the var and the value to be stored
    // 42 myVar ! (sets myVar = 42)
    private varSetValAtAddress(dictionary: Dictionary): (m: Machine) => void {
        // TODO FIXME, the closure is unnecessary now that we send Machine as arg
        const getWordAddress = dictionary.getWordAddress.bind(dictionary);
        return (m: Machine) => {
            assert(
                m.costack.peek() === Mode.EXECUTE,
                "varSetValAtAddress expects to be in EXECUTE Mode. But was: ${m.costack.peek()}"
            );
            assert(
                m.opstack.length > 1,
                "m.opstack must have at least two elements to pop. Has only ${m.opstack.length}"
            );
            const addressOfVar = m.opstack.pop();
            const newValue = m.opstack.pop();
            if (addressOfVar == null) {
                throw new Error(
                    "Unexpected address: ${addressOfVar} of variable: ${varName} with newValue: ${newValue}"
                );
            }
            this.machine.overwrite(newValue, addressOfVar);
        };
    }

    // @ retrieves the value of the variable
    // myVar @ (returns 42 on the m.opstack)
    private varGetValAtAddress(dictionary: Dictionary): (m: Machine) => void {
        const getWordAddress = dictionary.getWordAddress.bind(dictionary);
        return (m: Machine) => {
            assert(
                m.costack.peek() === Mode.EXECUTE,
                "varSetValAtAddress expects to be in EXECUTE Mode. But was: ${m.costack.peek()}"
            );
            assert(
                m.opstack.length > 0,
                "m.opstack must have at least one element to pop. Has only ${m.opstack.length}"
            );
            const addressOfVar = m.opstack.pop();
            if (addressOfVar == null) {
                throw new Error(`Unexpected address: ${addressOfVar}`);
            }
            const data = this.machine.read(addressOfVar);
            if (data == null || !(data.isInt() || data.isFloat())) {
                throw new Error(
                    `Must be a valid number at address: ${addressOfVar} was data: ${data}`
                );
            }
            const value = data.getValue();
            if (value == null || !isInt(value) || typeof value !== "number") {
                throw new Error(
                    `Unexpected type: ${typeof value} of value: ${value} at address: ${addressOfVar}`
                );
            }
            m.opstack.push(value);
        };
    }

    private loadCoreWords(): void {
        // 0 no pops
        this.addI8("0", 0);
        this.addI8("1", 1);
        this.addI8("PARSER", 0);

        // 1 pop
        this.addCoreCondition("IF", this.conditionIf);
        this.addCoreCondition("ELSE", this.conditionElse);
        this.addCoreCondition("THEN", this.conditionThen);
        this.addCoreFunc(":", this.compileStart);
        this.addCoreImmediate(";", this.compileEnd(this));
        this.addCoreFunc("CONST", this.constInitMode);
        this.addCoreFunc("VAR", this.varInitMode);
        this.addCoreFunc("!", this.varSetValAtAddress(this));
        this.addCoreFunc("@", this.varGetValAtAddress(this));
        this.addCoreFunc("DROP", (m: Machine) => m.opstack.pop());
        this.addCoreFunc("DUP", (m: Machine) =>
            m.opstack.push(m.opstack.peek())
        );
    //    this.addCoreFunc("NOT", (m: Machine) =>
    //    this.addCoreFunc("ABS", this.absoluteValue);
    //    this.addCoreFunc("=0", (m: Machine) =>
    //    this.addCoreFunc("<0", (m: Machine) =>
    //    this.addCoreFunc(">0", (m: Machine) =>

        // 0 no pops
        this.addCoreFunc("PS", (m: Machine) => console.log(m.opstack));
        this.addCoreFunc("PD", (m: Machine) => console.log(this));
        this.addCoreFunc("PM", (m: Machine) =>
            console.log(this.machine)
        );

        // 2 pop pops
        this.addCoreFunc("+", (m: Machine) =>
            m.opstack.push(m.opstack.pop() + m.opstack.pop())
        );
        this.addCoreFunc("-", (m: Machine) =>
            m.opstack.push(m.opstack.pop(-2) - m.opstack.pop())
        );
        this.addCoreFunc("*", (m: Machine) =>
            m.opstack.push(m.opstack.pop() * m.opstack.pop())
        );
        this.addCoreFunc("/", this.divideInt);
        this.addCoreFunc("=", (m: Machine) =>
            m.opstack.push(m.opstack.pop() === m.opstack.pop() ? 1 : 0)
        );
        this.addCoreFunc("<", (m: Machine) =>
            m.opstack.push(m.opstack.pop() > m.opstack.pop() ? 1 : 0)
        );
        this.addCoreFunc(">", (m: Machine) =>
            m.opstack.push(m.opstack.pop() < m.opstack.pop() ? 1 : 0)
        );
        this.addCoreFunc("OVER", (m: Machine) =>
            m.opstack.push(m.opstack.peek(-2))
        );
        this.addCoreFunc("SWAP", (m: Machine) =>
            m.opstack.push(m.opstack.pop(-2))
        );
        this.addCoreFunc("AND", (m: Machine) =>
            m.opstack.push(m.opstack.pop() & m.opstack.pop())
        );
        this.addCoreFunc("OR", (m: Machine) =>
            m.opstack.push(m.opstack.pop() | m.opstack.pop())
        );
        this.addCoreFunc("XOR", (m: Machine) =>
            m.opstack.push(m.opstack.pop() ^ m.opstack.pop())
        );
        this.addCoreFunc("<=0", (m: Machine) =>
            m.opstack.push(m.opstack.pop() <= 0 ? 1 : 0)
        );
        this.addCoreFunc(">=0", (m: Machine) =>
            m.opstack.push(m.opstack.pop() >= 0 ? 1 : 0)
        );
        this.addCoreFunc("MOD", this.mod);

        // 3 pop pop pops
        this.addCoreFunc("ROT", (m: Machine) =>
            m.opstack.push(m.opstack.pop(-3))
        );
    }

    toString(): string {
        const indent = "";
        let result = "";
        for (const [key, value] of Object.entries(this.core)) {
            result += `${indent}${key}: `;
            if (Array.isArray(value)) {
                const formattedItems = value.map((item) =>
                    typeof item === "function" ? "call" : String(item)
                );
                result += `[ ${formattedItems.join(", ")} ]`;
            } else if (typeof value === "object") {
                result += "dict\n";
            } else if (typeof value === "function") {
                result += "call\n";
            } else {
                result += String(value);
            }
            result += "\n";
        }
        return result;
    }
}
