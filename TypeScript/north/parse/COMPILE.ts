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
    m.compile_def_adrs = [] as number[];
    for (let index = 0; index < m.compile_definition.length; index++) {
      const token = m.compile_definition[index];
      if (!(typeof token === "string" && token.length > 0)) {
        throw new Error(
          "Compiled colon word must contain non-empty numbers or words",
        );
      }
      const address = m.dictionary.getWordAddress(token) as number;
      if (address === null && isInt(token)) {
        const newAddress = m.dictionary.addI8(token, parseInt(token, 10));
        m.compile_def_adrs.push(newAddress);
        continue;
      }
      assertInt("EXEC : compile end", address);

      const data = m.dictionary.getAction(token) as Data;
      assertData("EXEC : compile end", data);

      const value = data.getValue();
      if (data.isConditionFunc()) {
        const coreFunc = m.dictionary
          .getAction(":" + token)
          ?.getValue() as Func;
        coreFunc(m);
      } else if (data.isCoreFunc() && typeof value === "function") {
        m.compile_def_adrs.push(address);
      } else if (
        data.isColonFunc() &&
        typeof value === "number" &&
        data.getLength() > 1
      ) {
        // TODO m.compile_def_adrs.push(...value); // INLINE
        m.compile_def_adrs.push(address);
      } else if (data.isInt() && typeof value === "number") {
        m.compile_def_adrs.push(address);
      } else if (data.isStr() && typeof value === "string") {
        m.compile_def_adrs.push(address);
      } else {
        throw new Error(
          `Unexpected data: ${data} at address: ${address} of word: ${token}`,
        );
      }
    } // for each token in m.compile_definition

    while (!m.relAdrStack.is_empty()) {
      const rel_adr = m.relAdrStack.pop() as number;
      const rel_val = m.compile_def_adrs[rel_adr];
      let address = m.dictionary.getWordAddress(rel_val + "");
      if (address == null) {
        address = m.dictionary.addI8(rel_val + "", rel_val);
      }
      m.compile_def_adrs[rel_adr] = address;
    }
    m.compile_def_adrs.push(0);
    m.dictionary.addColonArray(wordName as string, m.compile_def_adrs); // returns address, ignored
    m.compile_definition = null;
    m.overwrite(
      d.getWordAddress("P_INTERPRET") as number,
      d.getWordAddress("PARSE") as number,
    );
  };

  const parseCOMPILE: Func = function (m: Machine): void {
    assertFuncIn(m, "P_:", 1);
    const token = m.inputBuffer.shift() as string;
    const data: Data | null = m.dictionary.getAction(token);
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
