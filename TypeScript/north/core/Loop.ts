import Machine from "../Machine";
import { Loadable, Func } from "../types";

export const Loop: Loadable = (ma: Machine): boolean => {
  const loopBegin: Func = function (m: Machine): void {
    throw new Error("BEGIN must be compiled");
  };

  const loopUntil: Func = function (m: Machine): void {
    throw new Error("UNTIL must be compiled");
  };

  const compileBegin: Func = function (m: Machine): void {
    const rel_adr_index = m.compile_def_adrs.length; // jump-to address placeholder (len = next)
    m.costack.push(rel_adr_index);
  };

  const compileUntil: Func = function (m: Machine): void {
    const next_rel_index = m.compile_def_adrs.length; // jump-from address placeholder
    const diff_rel_adr = (m.costack.pop() - next_rel_index) * 2; // back rel adr J=0
    if (diff_rel_adr >= 0) {
      // don't bother compiling BEGIN UNTIL with nothing between
      // throw new Error("Empty BEGIN UNTIL loop");
      // Except for infinite sleep loop, an empty
      // n BEGIN UNTIL
      // is equivilent to
      // n DROP
      m.compile_def_adrs.push(m.dictionary.getWordAddress("DROP") as number);
      // TODO
      // BEGIN m UNTIL
      // is similar to
      // m DROP
      // as well, except it may be less obvious that m is always a number
      return;
    }
    m.relAdrStack.push(next_rel_index);
    m.compile_def_adrs.push(diff_rel_adr);
    m.compile_def_adrs.push(m.dictionary.getWordAddress("J=0") as number);
  };

  const d = ma.dictionary;
  d.addCoreCondition("BEGIN", loopBegin);
  d.addCoreFunc(":BEGIN", compileBegin);
  d.addCoreCondition("UNTIL", loopUntil);
  d.addCoreFunc(":UNTIL", compileUntil);
  return true;
};
