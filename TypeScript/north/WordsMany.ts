import { isInt, Mode, assert, assertInt, assertIntNonZero, assertData, assertFuncOp } from "./Util";
import Machine from "./Machine";
import Data from "./Data";
import { DataType, Loadable, Func } from "./types";

export const wordsMany: Loadable = (ma: Machine): boolean => {
    const conditionIf: Func = function(m: Machine): void {
        const current = m.costack.peek();
        if (current === Mode.IGNORE || current === Mode.BLOCK) {
            m.costack.push(Mode.BLOCK);
        } else if (current === Mode.COMPILE) {
            m.costack.push(Mode.COMPILE);
        } else if (current === Mode.EXECUTE) {
            m.costack.push(m.opstack.pop() !== 0 ? Mode.EXECUTE : Mode.IGNORE);
        }
    }

    const conditionElse: Func = function(m: Machine): void {
        const current = m.costack.peek();
        if (current === Mode.IGNORE) {
            m.costack.toggle(Mode.EXECUTE);
        } else if (current === Mode.EXECUTE) {
            m.costack.toggle(Mode.IGNORE);
        }
    }

    const conditionThen: Func = function(m: Machine): void {
        if (m.costack.peek() === Mode.COMPILE) {
            throw new Error(
                "Executed condition must be from EXECUTE or IGNORE but not COMPILE mode"
            );
        }
        m.costack.pop(); // if EXECUTE else IGNORE else EXECUTE
    }

    const compileStart: Func = function(m: Machine): void {
        assert(
            m.costack.peek() === Mode.EXECUTE && m.compile_definition === null,
            "Start compilation from EXECUTE mode with no definition list"
        );
        m.costack.push(Mode.COMPILE);
        m.compile_definition = [];
        m.compile_word_name = null;
    }

    const compileEnd: Func = function(m: Machine): void {
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
            const address = m.dictionary.getWordAddress(token) as number;
            if (address === null && isInt(token)) {
                const newAddress = m.dictionary.addI8(
                    token,
                    parseInt(token, 10)
                );
                addressList.push(newAddress);
                continue;
            }
            assertInt("EXEC : compile end", address)

            const data = m.dictionary.getAction(token) as Data;
            assertData("EXEC : compile end", data);

            const value = data.getValue();
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

    const divideInt: Func = function(m: Machine): void {
        assertFuncOp(m, "/", 2);
        assertInt("/", m.opstack.peek(-2));
        assertIntNonZero("/", m.opstack.peek(-1));
        m.opstack.push(Math.floor(m.opstack.pop(-2) / m.opstack.pop()));
    }

    const mod: Func = function(m: Machine): void {
        assertFuncOp(m, "MOD", 2);
        assertInt("MOD", m.opstack.peek(-2));
        assertIntNonZero("MOD", m.opstack.peek(-1));
        let d = m.opstack.pop() as number;
        if (d < 0) d = -d;
        let n = m.opstack.pop() as number;
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
