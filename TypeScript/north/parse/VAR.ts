import { isInt, Mode, assert } from "../Util";
import { DataType } from "../types";
//import Data from '../Data';
import Machine from '../Machine';

export const VAR = (ma: Machine): boolean => {

    // VAR myVar
    function initVAR(m: Machine): void {
        m.overwrite(d.getWordAddress("P_VAR") as number,
            d.getWordAddress("PARSE") as number);
    }

    // VAR (name)
    // sets value 0 at new address A
    // sets address of A at new addess B
    // associates dictionary[name] = address of B
    // dictionary.lookup(name) returns (address A) (value at address B)
    // TODO define var as the address of a CONST
    function parseVAR(m: Machine): void {
        m.dictionary.addPointer(m.inputBuffer.shift() as string,
            0, DataType.f64);

        m.overwrite(d.getWordAddress("P_INTERPRET") as number,
                d.getWordAddress("PARSE") as number);
    }

    // ! takes the address of the var and the value to be stored
    // 42 myVar ! (sets myVar = 42)
    function varSetValAtAddress(m: Machine): void {
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
        m.overwrite(newValue, addressOfVar);
    }

    // @ retrieves the value of the variable
    // myVar @ (returns 42 on the m.opstack)
    function varGetValAtAddress(m: Machine): void {
        assert(
            m.opstack.length > 0,
            "m.opstack must have at least one element to pop. Has only ${m.opstack.length}"
        );
        const addressOfVar = m.opstack.pop();
        if (addressOfVar == null) {
            throw new Error(`Unexpected address: ${addressOfVar}`);
        }
        const data = m.read(addressOfVar);
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
    }

    const d = ma.dictionary;
    d.addCoreFunc("!", varSetValAtAddress);
    d.addCoreFunc("@", varGetValAtAddress);
    d.addCoreFunc("P_VAR", parseVAR);
    d.addCoreFunc("VAR", initVAR);

    return true;
}
