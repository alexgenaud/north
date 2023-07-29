import { isInt, assertInt, assertFuncIn, assertData } from "../Util";
import Machine from "../Machine";
import Data from "../Data";
import { Loadable, Func } from "../types";

export const COMPILE: Loadable = (ma: Machine): boolean => {
  const initCOMPILE: Func = function (m: Machine): void {
    m.compile_definition = [];
    m.overwrite(
      d.getWordAddress("P_:") as number,
      d.getWordAddress("PARSE") as number,
    );
  };

  const endCOMPILE: Func = function (m: Machine): void {
    if (m.compile_definition == null || !Array.isArray(m.compile_definition)) {
      throw new Error(
        `Must end compilation with definition list: ${m.compile_definition}`,
      );
    }
    const wordName = m.compile_definition.shift();
    const addressList: number[] = [];
    for (const token of m.compile_definition) {
      if (!(typeof token === "string" && token.length > 0)) {
        throw new Error(
          "Compiled colon word must contain non-empty numbers or words",
        );
      }
      const address = m.dictionary.getWordAddress(token) as number;
      if (address === null && isInt(token)) {
        const newAddress = m.dictionary.addI8(token, parseInt(token, 10));
        addressList.push(newAddress);
        continue;
      }
      assertInt("EXEC : compile end", address);

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
          `Unexpected data: ${data} at address: ${address} of word: ${token}`,
        );
      }
    }
    m.dictionary.addColonArray(wordName as string, addressList); // returns address, ignored
    m.compile_definition = null;

    m.overwrite(
      d.getWordAddress("P_INTERPRET") as number,
      d.getWordAddress("PARSE") as number,
    );
  };

  const parseCOMPILE: Func = function (m: Machine): void {
    assertFuncIn(m, "P_:", 1);
    const token = m.inputBuffer.shift() as string;

    // must be the first word after :
    // -- : NAME ... ... ...
    // TODO -- : ; --- what should happen? nothing at all
    // TODO other weird cases like -- : CONST --

    // TODO handle immediate words
    // like ( ... ) ." ... " maybe CONST and VAR
    const data: Data | null = m.dictionary.getAction(token);
    //if (data == null) {
    //    if (isInt(token))
    //}

    if (token === ";" && data != null && data.isImmediateFunc()) {
      endCOMPILE(m);
      return;
    }

    // TODO should really handle immediate words and definitions
    if (m.compile_definition == null) {
      throw new Error(
        "Compile_definition is empty while parsing compile definition",
      );
    }
    m.compile_definition.push(token);
  };

  const d = ma.dictionary;
  d.addCoreFunc(":", initCOMPILE);
  d.addCoreFunc("P_:", parseCOMPILE);
  d.addCoreImmediate(";", endCOMPILE);
  return true;
};
