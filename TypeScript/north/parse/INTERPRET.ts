import {
  Mode,
  assertData,
  assertFuncIn,
  assertInt,
  assertNonNull,
  isInt,
} from "../Util";
import Data from "../Data";
import Machine from "../Machine";
import { Loadable, Func } from "../types";

export const INTERPRET: Loadable = (ma: Machine): boolean => {
  const CONDITIONAL_IGNORE_MODES = [Mode.IGNORE, Mode.BLOCK];

  const exec_colon_word = function (m: Machine, first_address: number): void {
    let pc = first_address; // program counter
    for (; pc < 200; pc += 2) {
      const address: number = m.read(pc).getValue() as number;
      assertInt("EXEC", address);
      if (address === 0) return;
      const data: Data = m.read(address);
      assertData("EXEC", data);
      const mode: Mode = m.costack.peek();
      if (CONDITIONAL_IGNORE_MODES.includes(mode) && !data.isConditionFunc()) {
        // TODO COMPILED EXECUTED words should jump
        continue;
      }
      exec_value(m, data);
    }
  };

  const exec_value = function (m: Machine, data: Data) {
    const value = data.getValue();
    assertNonNull("EXEC value", value);
    if (data.isCoreFunc() && typeof value === "function") {
      value(m);
    } else if (data.isColonFunc() && data.getLength() > 0) {
      exec_colon_word(m, value as number);
    } else if (data.isInt() && isInt(value)) {
      m.opstack.push(value as number);
    } else if (data.isFloat() && typeof value === "number") {
      m.opstack.push(value as number);
    } else if (data.isStr() && typeof value === "string") {
      m.opstack.push(value as string);
    } else {
      throw new Error(`Unknown type: ${typeof value} of value: ${value}`);
    }
  };

  const parseINTERPRET: Func = (m: Machine): void => {
    assertFuncIn(m, "P_INTERPRET", 1);
    const token = m.inputBuffer.shift();
    if (token == null || (typeof token === "string" && token.length < 1)) {
      return;
    }
    const data: Data | null = m.dictionary.getAction(token);
    const mode: Mode = m.costack.peek();
    if (
      CONDITIONAL_IGNORE_MODES.includes(mode) &&
      (data == null || !data.isConditionFunc())
    ) {
      return;
    }
    if (data == null) {
      assertInt("P_INTERPRET", token);
      m.opstack.push(parseInt(token, 10));
      return;
    }
    exec_value(m, data);
  };

  const d = ma.dictionary;
  d.addI8("PARSE", 0);
  const adrOfInterpret = d.addCoreFunc("P_INTERPRET", parseINTERPRET);
  ma.overwrite(adrOfInterpret, d.getWordAddress("PARSE") as number);
  return true;
};
