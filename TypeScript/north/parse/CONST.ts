import { assert } from "../Util";
//import Data from '../Data';
import Machine from '../Machine';

export const CONST = (ma: Machine): boolean => {
    // 220 CONSTANT LIMIT
    // The word LIMIT returns its value not its address
    function initCONST(m: Machine): void {
        const i8parserAdr = d.getWordAddress("PARSE");
        if (i8parserAdr == null) throw new Error("PARSE flag not preset");
        const i8ParserCoreAdr = d.getWordAddress("P_CONST");
        if (i8ParserCoreAdr == null || i8ParserCoreAdr === 0) throw new Error("P_CONST not defined");
        m.overwrite(i8ParserCoreAdr, i8parserAdr);
    }

    function parseCONST(m: Machine): void {
        assert(
            m.inputBuffer.length > 0,
            `m.inputBuffer must have at least one element to shift. Has only ${m.inputBuffer.length}`
        );
        assert(
            m.opstack.length > 0,
            `m.opstack must have at least one element to pop. Has only ${m.opstack.length}`
        );
        //m.dictionary.addNumber(m.opstack.pop(),
        //    m.opstack.pop()); // name, early value

        // -- 5 CONST V
        m.dictionary.addNumber(m.inputBuffer.shift() as string, // name from input
            m.opstack.pop()); // early value from op stack

        const i8parserAdr = d.getWordAddress("PARSE");
        if (i8parserAdr == null) throw new Error("PARSE flag not preset");
        m.overwrite(d.getWordAddress("P_INTERPRET") as number,
            i8parserAdr);
    }

    const d = ma.dictionary;
    d.addCoreFunc("P_CONST", parseCONST);
    d.addCoreFunc("CONST", initCONST);

    return true;
}
