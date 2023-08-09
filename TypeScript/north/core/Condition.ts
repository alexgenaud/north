import { Mode } from "../Util";
import Machine from "../Machine";
import { Loadable, Func } from "../types";

export const Condition: Loadable = (ma: Machine): boolean => {
  const conditionIf: Func = function (m: Machine): void {
    const current = m.costack.peek();
    if (current === Mode.IGNORE || current === Mode.BLOCK) {
      m.costack.push(Mode.BLOCK);
    } else if (current === Mode.COMPILE) {
      m.costack.push(Mode.COMPILE);
    } else if (current === Mode.EXECUTE) {
      m.costack.push(m.opstack.pop() !== 0 ? Mode.EXECUTE : Mode.IGNORE);
    }
  };

  const conditionElse: Func = function (m: Machine): void {
    const current = m.costack.peek();
    if (current === Mode.IGNORE) {
      m.costack.toggle(Mode.EXECUTE);
    } else if (current === Mode.EXECUTE) {
      m.costack.toggle(Mode.IGNORE);
    }
  };

  const conditionThen: Func = function (m: Machine): void {
    if (m.costack.peek() === Mode.COMPILE) {
      throw new Error(
        "Executed condition must be from EXECUTE or IGNORE but not COMPILE mode",
      );
    }
    m.costack.pop(); // if EXECUTE else IGNORE else EXECUTE
  };

  const compileIf: Func = function (m: Machine): void {
    const rel_adr_index = m.compile_def_adrs.push(0) - 1; // jump-to address placeholder
    m.costack.push(rel_adr_index);
    m.relAdrStack.push(rel_adr_index);
    m.compile_def_adrs.push(m.dictionary.getWordAddress("J=0") as number);
  };

  const compileElse: Func = function (m: Machine): void {
    const prev_rel_adr_index = m.costack.pop(); // from IF
    const rel_adr_index = m.compile_def_adrs.push(0) - 1; // jump-to address placeholder
    m.costack.push(rel_adr_index);
    m.relAdrStack.push(rel_adr_index);
    m.compile_def_adrs.push(m.dictionary.getWordAddress("JMP") as number);
    m.compile_def_adrs[prev_rel_adr_index] =
      (rel_adr_index - prev_rel_adr_index + 2) * 2; // update IF J=0 rel adr
  };

  const compileThen: Func = function (m: Machine): void {
    const prev_rel_adr_index = m.costack.pop(); // from ELSE
    const next_rel_adr_index = m.compile_def_adrs.length; // jump-to address placeholder
    m.compile_def_adrs[prev_rel_adr_index] =
      (next_rel_adr_index - prev_rel_adr_index) * 2; // update ELSE JMP rel adr
  };

  const d = ma.dictionary;
  d.addCoreCondition("IF", conditionIf);
  d.addCoreFunc(":IF", compileIf);
  d.addCoreCondition("ELSE", conditionElse);
  d.addCoreFunc(":ELSE", compileElse);
  d.addCoreCondition("THEN", conditionThen);
  d.addCoreFunc(":THEN", compileThen);
  return true;
};
