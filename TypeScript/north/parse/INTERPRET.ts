import { Mode, assert } from "../Util";
//import Data from '../Data';
import Machine from '../Machine';

export const INTERPRET = (ma: Machine): boolean => {

    function parseINTERPRET(m: Machine): void {
        const parsePtr = m.dictionary.getWordAddress("PARSE") as number;
        while (!m.inputBuffer.isEmpty()) {
            const adrOfParser = m.read(parsePtr).getValue() as number;
            const interpretPtr = m.dictionary.getWordAddress("P_INTERPRET") as number;
            if (interpretPtr === adrOfParser) {
                const token = m.inputBuffer.shift();
                if (token == null) continue;
                m.execute(token);
            } else {
                const parser = m.read(adrOfParser).getValue() as (m: Machine) => void
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
