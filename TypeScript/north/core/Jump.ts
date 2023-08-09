import { assertInt, assertFuncOp } from "../Util";
import Machine from "../Machine";
import { Loadable, Func } from "../types";

export const Jump: Loadable = (ma: Machine): boolean => {
  const jumpIfZero: Func = function (m: Machine): void {
    assertFuncOp(m, "J=0", 2);
    assertInt("J=0", m.opstack.peek(-2)); // conditional (0?)
    assertInt("J=0", m.opstack.peek(-1)); // address
    const rel_adr = m.opstack.pop();
    if (m.opstack.pop() === 0) {
      m.program_counter += rel_adr - 4;
    }
  };

  const jumpMandatory: Func = function (m: Machine): void {
    assertFuncOp(m, "JMP", 1);
    assertInt("JMP", m.opstack.peek()); // address
    const rel_adr = m.opstack.pop();
    m.program_counter += rel_adr - 4;
  };

  const d = ma.dictionary;
  d.addCoreFunc("JMP", jumpMandatory);
  d.addCoreFunc("J=0", jumpIfZero);
  return true;
};
