import Machine from "../Machine";
import { assertFuncOp } from "../Util";
import { Loadable, Func } from "../types";

export const Loop: Loadable = (ma: Machine): boolean => {
  const loopBegin: Func = function (m: Machine): void {
    throw new Error("BEGIN must be compiled");
  };

  const loopUntil: Func = function (m: Machine): void {
    throw new Error("UNTIL must be compiled");
  };

  const compileBegin: Func = function (m: Machine): void {
    m.costack.push(m.compile_def_adrs.length); // jump-to address placeholder (len = next)
  };

  const compileUntil: Func = function (m: Machine): void {
    const next_rel_index = m.compile_def_adrs.length; // jump-from address placeholder
    const diff_rel_adr = (m.costack.pop() - next_rel_index) * 2; // back rel adr J=0
    if (diff_rel_adr >= 0) {
      // don't bother compiling BEGIN UNTIL with nothing between
      // Except for infinite sleep loop, an empty
      // : n BEGIN UNTIL ; is equivilent to : n DROP ;
      m.compile_def_adrs.push(m.dictionary.getWordAddress("DROP") as number);
      return;
    }
    m.relAdrStack.push(next_rel_index);
    m.compile_def_adrs.push(diff_rel_adr);
    m.compile_def_adrs.push(m.dictionary.getWordAddress("J=0") as number);
  };

  const loopDo: Func = function (m: Machine): void {
    assertFuncOp(m, "DO", 2);
    // S : [ LIMIT=5 INDEX=0 ] ---> C : [ LIMIT=5 INDEX=0  ]
    const index = m.opstack.pop();
    m.costack.push(m.opstack.pop()); // limit
    m.costack.push(index);
  };

  const loopLoop: Func = function (m: Machine): void {
    assertFuncOp(m, "LOOP", 1);
    // S : [ LIMIT=5 INDEX=0 ] ---> C : [ LIMIT=5 INDEX=0  ]
    const index = m.costack.pop() + 1;
    const jump_back = m.opstack.pop();
    if (jump_back < 0 && index < m.costack.peek()) {
      // index < limit
      m.program_counter += jump_back - 4;
      m.costack.push(index);
      return; // loop again
    }
    m.costack.pop(); // clear costack and continue after loop
  };

  const compileDo: Func = function (m: Machine): void {
    m.costack.push(m.compile_def_adrs.length + 1); // jump-to address placeholder (len = next)
    m.compile_def_adrs.push(m.dictionary.getWordAddress("DO") as number);
  };

  const compileLoop: Func = function (m: Machine): void {
    const next_rel_index = m.compile_def_adrs.length; // jump-from address placeholder
    const diff_rel_adr = (m.costack.pop() - next_rel_index) * 2; // back rel adr J=0
    m.relAdrStack.push(next_rel_index);
    m.compile_def_adrs.push(diff_rel_adr);
    m.compile_def_adrs.push(m.dictionary.getWordAddress("LOOP") as number);
  };

  const d = ma.dictionary;
  d.addCoreCondition("BEGIN", loopBegin);
  d.addCoreFunc(":BEGIN", compileBegin);
  d.addCoreCondition("UNTIL", loopUntil);
  d.addCoreFunc(":UNTIL", compileUntil);
  d.addCoreFunc("I", (m: Machine) => m.opstack.push(m.costack.peek(-1)));
  d.addCoreFunc("J", (m: Machine) => m.opstack.push(m.costack.peek(-3)));
  d.addCoreFunc("K", (m: Machine) => m.opstack.push(m.costack.peek(-5)));
  d.addCoreCondition("DO", loopDo);
  d.addCoreFunc(":DO", compileDo);
  d.addCoreCondition("LOOP", loopLoop);
  d.addCoreFunc(":LOOP", compileLoop);
  return true;
};
