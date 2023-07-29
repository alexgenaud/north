import Machine from "../Machine";
import { Loadable } from "../types";

export const BasicArgOne: Loadable = (ma: Machine): boolean => {
  const d = ma.dictionary;
  d.addCoreFunc("DROP", (m: Machine) => m.opstack.pop());
  d.addCoreFunc("DUP", (m: Machine) => m.opstack.push(m.opstack.peek()));
  d.addCoreFunc("NOT", (m: Machine) => m.opstack.push(~m.opstack.pop()));
  d.addCoreFunc("ABS", (m: Machine) => {
    const a = m.opstack.pop() as number;
    m.opstack.push(a >= 0 ? a : -a);
  });
  d.addCoreFunc("=0", (m: Machine) =>
    m.opstack.push(m.opstack.pop() === 0 ? 1 : 0),
  );
  d.addCoreFunc("<0", (m: Machine) =>
    m.opstack.push(m.opstack.pop() < 0 ? 1 : 0),
  );
  d.addCoreFunc("<=0", (m: Machine) =>
    m.opstack.push(m.opstack.pop() <= 0 ? 1 : 0),
  );
  d.addCoreFunc(">0", (m: Machine) =>
    m.opstack.push(m.opstack.pop() > 0 ? 1 : 0),
  );
  d.addCoreFunc(">=0", (m: Machine) =>
    m.opstack.push(m.opstack.pop() >= 0 ? 1 : 0),
  );
  return true;
};
