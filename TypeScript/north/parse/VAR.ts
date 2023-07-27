import { isInt, assertFuncOp, assertFuncIn, assertInt, assertDataNumber } from "../Util";
import { DataType, Loadable, Func } from "../types";
import Machine from '../Machine';

export const VAR: Loadable = (ma: Machine): boolean => {

    // VAR myVar
    const initVAR: Func = function(m: Machine): void {
        m.overwrite(d.getWordAddress("P_VAR") as number,
            d.getWordAddress("PARSE") as number);
    }

    const parseVAR: Func = function(m: Machine): void {
        assertFuncIn(m, "P_VAR", 1);
        m.dictionary.addPointer(m.inputBuffer.shift() as string,
            0, DataType.f64);
        m.overwrite(d.getWordAddress("P_INTERPRET") as number,
                d.getWordAddress("PARSE") as number);
    }

    // ! takes the address of the var and the value to be stored
    // 42 myVar ! (sets myVar = 42) -- (value) (address) (this func)
    const varSetValAtAddress: Func = function(m: Machine): void {
        assertFuncOp(m, "!", 2);
        assertInt("!", m.opstack.peek(-1));
        assertInt("!", m.opstack.peek(-2));
        m.overwrite(m.opstack.pop(-2) as number, // new value
            m.opstack.pop()); // adddress of var
    }

    // @ retrieves the value of the variable
    // myVar @ (returns 42 on the m.opstack)
    const varGetValAtAddress: Func = function(m: Machine): void {
        assertFuncOp(m, "@", 1);
        assertInt("@", m.opstack.peek());
        const data = m.read(m.opstack.pop() as number); // address of var
        assertDataNumber("@", data);
        m.opstack.push(data.getValue() as number);
    }

    const d = ma.dictionary;
    d.addCoreFunc("!", varSetValAtAddress);
    d.addCoreFunc("@", varGetValAtAddress);
    d.addCoreFunc("P_VAR", parseVAR);
    d.addCoreFunc("VAR", initVAR);

    return true;
}
