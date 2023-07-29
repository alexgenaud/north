import { isInt, assertInt, assertData, assertFuncIn, Mode } from "../Util";
import Data from "../Data";
import Machine from "../Machine";
import { Loadable, Func } from "../types";

export const INTERPRET: Loadable = (ma: Machine): boolean => {
  const CONDITIONAL_IGNORE_MODES = [Mode.IGNORE, Mode.BLOCK];

  const exec_colon_word = function (m: Machine, address_list: number[]): void {
    for (const address of address_list) {
      assertInt("EXEC : word", address);
      const data: Data = m.read(address);
      assertData("EXEC : word", data);
      const value = data.getValue();
      const mode: Mode = m.costack.peek();
      if (CONDITIONAL_IGNORE_MODES.includes(mode) && !data.isConditionFunc()) {
        continue;
      }
      if (data.isFunc() && typeof value === "function") {
        value(m);
      } else if (data.isInt() && typeof value === "number") {
        m.opstack.push(value);
      } else if (data.isStr() && typeof value === "string") {
        m.opstack.push(value);
      } else if (data.isColonFunc() && Array.isArray(value)) {
        exec_colon_word(m, value);
      } else {
        throw new Error(`Unknown type: ${typeof value} of value: ${value}`);
      }
    }
  };

  const exec_interpret = function (m: Machine, token: string): void {
    if (token == null || (typeof token === "string" && token.length < 1)) {
      return;
    }
    const mode: Mode = m.costack.peek();
    const data: Data | null = m.dictionary.getAction(token);

    if (
      mode === Mode.EXECUTE ||
      (CONDITIONAL_IGNORE_MODES.includes(mode) &&
        data !== null &&
        data.isConditionFunc())
    ) {
      if (data == null) {
        if (isInt(token)) {
          m.opstack.push(parseInt(token, 10));
        } else if (typeof token === "string") {
          m.opstack.push(token);
        } else {
          throw new Error(`Unexpected token: ${token} and action: null`);
        }
        return;
      }
      const value = data.getValue();
      if (value == null) {
        throw new Error(
          `Null action.value of token: ${token}. Action data: ${data}`,
        );
      }
      if (data.isCoreFunc() && typeof value === "function") {
        value(m);
      } else if (data.isColonFunc() && Array.isArray(value)) {
        exec_colon_word(m, value);
      } else if (data.isInt() && isInt(value)) {
        m.opstack.push(value as number);
      } else if (data.isFloat() && typeof value === "number") {
        m.opstack.push(value as number);
      } else if (data.isStr() && typeof value === "string") {
        m.opstack.push(value as string);
      } else {
        throw new Error(
          "Unexpected token: " +
            token +
            " or type of action data value: " +
            value,
        );
      }
      return;
    } else if (CONDITIONAL_IGNORE_MODES.includes(mode)) {
      return;
    } else {
      throw new Error(
        `Unknown mode state: ${mode} all mode stack: ${m.costack.toString()}`,
      );
    }
  };

  const parseINTERPRET: Func = (m: Machine): void => {
    const parsePtr = m.dictionary.getWordAddress("PARSE") as number;
    const interpretPtr = m.dictionary.getWordAddress("P_INTERPRET") as number;
    while (!m.inputBuffer.isEmpty()) {
      const adrOfParser = m.read(parsePtr).getValue() as number;
      if (interpretPtr === adrOfParser) {
        assertFuncIn(m, "P_INTERPRET", 1);
        const token = m.inputBuffer.shift();
        if (token == null) continue;
        exec_interpret(m, token);
      } else {
        // TODO: redundant or circular checks,
        // perhaps QUIT loop only should determine
        // which parser/interpreter to use
        const parser = m.read(adrOfParser).getValue() as Func;
        parser(m);
      }
    }
  };

  const d = ma.dictionary;
  d.addI8("PARSE", 0);
  d.addCoreFunc("P_INTERPRET", parseINTERPRET);
  ma.overwrite(
    d.getWordAddress("P_INTERPRET") as number,
    d.getWordAddress("PARSE") as number,
  );
  return true;
};
