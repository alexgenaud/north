import { isInt, Mode, assert } from "../north/Util";
import Machine from "../north/Machine";
import { DataType } from "./types";

export const wordsMany = (ma: Machine): boolean => {
    function conditionIf(m: Machine): void {
        const current = m.costack.peek();
        if (current === Mode.IGNORE || current === Mode.BLOCK) {
            m.costack.push(Mode.BLOCK);
        } else if (current === Mode.COMPILE) {
            m.costack.push(Mode.COMPILE);
        } else if (current === Mode.EXECUTE) {
            m.costack.push(m.opstack.pop() !== 0 ? Mode.EXECUTE : Mode.IGNORE);
        }
    }

    function conditionElse(m: Machine): void {
        const current = m.costack.peek();
        if (current === Mode.IGNORE) {
            m.costack.toggle(Mode.EXECUTE);
        } else if (current === Mode.EXECUTE) {
            m.costack.toggle(Mode.IGNORE);
        }
    }

    function conditionThen(m: Machine): void {
        if (m.costack.peek() === Mode.COMPILE) {
            throw new Error(
                "Executed condition must be from EXECUTE or IGNORE but not COMPILE mode"
            );
        }
        m.costack.pop(); // if EXECUTE else IGNORE else EXECUTE
    }

    function compileStart(m: Machine): void {
        assert(
            m.costack.peek() === Mode.EXECUTE && m.compile_definition === null,
            "Start compilation from EXECUTE mode with no definition list"
        );
        m.costack.push(Mode.COMPILE);
        m.compile_definition = [];
        m.compile_word_name = null;
    }

    function compileEnd(m: Machine): void {
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
            const address = m.dictionary.getWordAddress(token);
            if (address === null && isInt(token)) {
                const newAddress = m.dictionary.addI8(
                    token,
                    parseInt(token, 10)
                );
                addressList.push(newAddress);
                continue;
            }
            if (typeof address !== "number") {
                throw new Error("Extant action must have number address");
            }
            const data = m.dictionary.getAction(token);
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
        m.dictionary.addColonArray(wordName as string, addressList); // returns address, ignored
        m.compile_definition = null;
        m.costack.pop();
        if (m.costack.peek() !== Mode.EXECUTE) {
            throw new Error("Expected to pop out of COMPILE into EXECUTE mode");
        }
    }



    function divideInt(m: Machine): void {
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

    function mod(m: Machine): void {
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

    const d = ma.dictionary;
    // 0 no pops
    d.addI8("0", 0);
    d.addI8("1", 1);
    d.addI8("NXTMEM", 0);

    // 1 pop
    d.addCoreCondition("IF", conditionIf);
    d.addCoreCondition("ELSE", conditionElse);
    d.addCoreCondition("THEN", conditionThen);
    d.addCoreFunc(":", compileStart);
    d.addCoreImmediate(";", compileEnd);
    d.addCoreFunc("DROP", (m: Machine) => m.opstack.pop());
    d.addCoreFunc("DUP", (m: Machine) => m.opstack.push(m.opstack.peek()));
    //    d.addCoreFunc("NOT", (m: Machine) =>
    //    d.addCoreFunc("ABS", absoluteValue);
    //    d.addCoreFunc("=0", (m: Machine) =>
    //    d.addCoreFunc("<0", (m: Machine) =>
    //    d.addCoreFunc(">0", (m: Machine) =>

    // 0 no pops
    d.addCoreFunc("PS", (m: Machine) => console.log(m.opstack));
    d.addCoreFunc("PD", (m: Machine) => console.log(m.dictionary));
    d.addCoreFunc("PM", (m: Machine) => console.log(m));

    // 2 pop pops
    d.addCoreFunc("+", (m: Machine) =>
        m.opstack.push(m.opstack.pop() + m.opstack.pop())
    );
    d.addCoreFunc("-", (m: Machine) =>
        m.opstack.push(m.opstack.pop(-2) - m.opstack.pop())
    );
    d.addCoreFunc("*", (m: Machine) =>
        m.opstack.push(m.opstack.pop() * m.opstack.pop())
    );
    d.addCoreFunc("/", divideInt);
    d.addCoreFunc("=", (m: Machine) =>
        m.opstack.push(m.opstack.pop() === m.opstack.pop() ? 1 : 0)
    );
    d.addCoreFunc("<", (m: Machine) =>
        m.opstack.push(m.opstack.pop() > m.opstack.pop() ? 1 : 0)
    );
    d.addCoreFunc(">", (m: Machine) =>
        m.opstack.push(m.opstack.pop() < m.opstack.pop() ? 1 : 0)
    );
    d.addCoreFunc("OVER", (m: Machine) => m.opstack.push(m.opstack.peek(-2)));
    d.addCoreFunc("SWAP", (m: Machine) => m.opstack.push(m.opstack.pop(-2)));
    d.addCoreFunc("AND", (m: Machine) =>
        m.opstack.push(m.opstack.pop() & m.opstack.pop())
    );
    d.addCoreFunc("OR", (m: Machine) =>
        m.opstack.push(m.opstack.pop() | m.opstack.pop())
    );
    d.addCoreFunc("XOR", (m: Machine) =>
        m.opstack.push(m.opstack.pop() ^ m.opstack.pop())
    );
    d.addCoreFunc("<=0", (m: Machine) =>
        m.opstack.push(m.opstack.pop() <= 0 ? 1 : 0)
    );
    d.addCoreFunc(">=0", (m: Machine) =>
        m.opstack.push(m.opstack.pop() >= 0 ? 1 : 0)
    );
    d.addCoreFunc("MOD", mod);

    // 3 pop pop pops
    d.addCoreFunc("ROT", (m: Machine) => m.opstack.push(m.opstack.pop(-3)));

    return true;
};
