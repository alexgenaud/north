import { assertFuncIn } from "../Util";
import Machine from '../Machine';
import { Loadable, Func } from "../types";

export const INTERPRET: Loadable = (ma: Machine): boolean => {

    const parseINTERPRET: Func = (m: Machine): void => {
        const parsePtr = m.dictionary.getWordAddress("PARSE") as number;
        const interpretPtr = m.dictionary.getWordAddress("P_INTERPRET") as number;
        while (!m.inputBuffer.isEmpty()) {
            const adrOfParser = m.read(parsePtr).getValue() as number;
            if (interpretPtr === adrOfParser) {
                assertFuncIn(m, "P_INTERPRET", 1);
                const token = m.inputBuffer.shift();
                if (token == null) continue;
                m.execute(token);
            } else {
                // TODO: redundant or circular checks,
                // perhaps QUIT loop only should determine
                // which parser/interpreter to use
                const parser = m.read(adrOfParser).getValue() as Func
                parser(m);
            }
        }
    }

    const d = ma.dictionary;
    d.addI8("PARSE", 0);
    d.addCoreFunc("P_INTERPRET", parseINTERPRET);
    ma.overwrite(d.getWordAddress("P_INTERPRET") as number,
        d.getWordAddress("PARSE") as number);
    return true;
}
