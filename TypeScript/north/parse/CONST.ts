import { assertFuncOpIn, assertInt } from "../Util";
//import Data from '../Data';
import Machine from "../Machine";
import { Loadable, Func } from "../types";

export const CONST: Loadable = (ma: Machine): boolean => {
  // 220 CONSTANT LIMIT
  // The word LIMIT returns its value not its address
  const initCONST: Func = function (m: Machine): void {
    m.overwrite(
      d.getWordAddress("P_CONST") as number,
      d.getWordAddress("PARSE") as number,
    );
  };

  const parseCONST: Func = function (m: Machine): void {
    assertFuncOpIn(m, "P_CONST", 1, 1);
    assertInt("P_CONST", m.opstack.peek());

    // -- 5 CONST V -- (op.pop) (this func) (in.shift)
    m.dictionary.addNumber(
      m.inputBuffer.shift() as string, // name from input
      m.opstack.pop(),
    ); // early value from op stack
    m.overwrite(
      d.getWordAddress("P_INTERPRET") as number,
      d.getWordAddress("PARSE") as number,
    );
  };

  const d = ma.dictionary;
  d.addCoreFunc("P_CONST", parseCONST);
  d.addCoreFunc("CONST", initCONST);

  return true;
};
