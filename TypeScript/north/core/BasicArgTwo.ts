import { assertInt, assertIntNonZero, assertFuncOp } from "../Util";
import Machine from "../Machine";
import { Loadable, Func } from "../types";

export const BasicArgTwo: Loadable = (ma: Machine): boolean => {
  const divideInt: Func = function (m: Machine): void {
    assertFuncOp(m, "/", 2);
    assertInt("/", m.opstack.peek(-2));
    assertIntNonZero("/", m.opstack.peek(-1));
    m.opstack.push(Math.floor(m.opstack.pop(-2) / m.opstack.pop()));
  };

  const mod: Func = function (m: Machine): void {
    assertFuncOp(m, "MOD", 2);
    assertInt("MOD", m.opstack.peek(-2));
    assertIntNonZero("MOD", m.opstack.peek(-1));
    let d = m.opstack.pop() as number;
    if (d < 0) d = -d;
    let n = m.opstack.pop() as number;
    if (n < 0) n += d * n * -1;
    m.opstack.push((n % d) + 0); // -0 is possible ! :o
  };

  const d = ma.dictionary;
  // 0 no pops
  d.addCoreFunc("PS", (m: Machine) => console.log(m.opstack));
  d.addCoreFunc("PD", (m: Machine) => console.log(m.dictionary));
  d.addCoreFunc("PM", (m: Machine) => console.log(m));

  // 2 two pops
  d.addCoreFunc("+", (m: Machine) =>
    m.opstack.push(m.opstack.pop() + m.opstack.pop()),
  );
  d.addCoreFunc("-", (m: Machine) =>
    m.opstack.push(m.opstack.pop(-2) - m.opstack.pop()),
  );
  d.addCoreFunc("*", (m: Machine) =>
    m.opstack.push(m.opstack.pop() * m.opstack.pop()),
  );
  d.addCoreFunc("/", divideInt);
  d.addCoreFunc("=", (m: Machine) =>
    m.opstack.push(m.opstack.pop() === m.opstack.pop() ? 1 : 0),
  );
  d.addCoreFunc("<", (m: Machine) =>
    m.opstack.push(m.opstack.pop() > m.opstack.pop() ? 1 : 0),
  );
  d.addCoreFunc(">", (m: Machine) =>
    m.opstack.push(m.opstack.pop() < m.opstack.pop() ? 1 : 0),
  );
  d.addCoreFunc("<=", (m: Machine) =>
    m.opstack.push(m.opstack.pop() >= m.opstack.pop() ? 1 : 0),
  );
  d.addCoreFunc(">=", (m: Machine) =>
    m.opstack.push(m.opstack.pop() <= m.opstack.pop() ? 1 : 0),
  );
  d.addCoreFunc("OVER", (m: Machine) => m.opstack.push(m.opstack.peek(-2)));
  d.addCoreFunc("SWAP", (m: Machine) => m.opstack.push(m.opstack.pop(-2)));
  d.addCoreFunc("AND", (m: Machine) =>
    m.opstack.push(m.opstack.pop() & m.opstack.pop()),
  );
  d.addCoreFunc("OR", (m: Machine) =>
    m.opstack.push(m.opstack.pop() | m.opstack.pop()),
  );
  d.addCoreFunc("XOR", (m: Machine) =>
    m.opstack.push(m.opstack.pop() ^ m.opstack.pop()),
  );
  d.addCoreFunc("MOD", mod);
  d.addCoreFunc("2DUP", (m: Machine) => {
    m.opstack.push(m.opstack.peek(-2));
    m.opstack.push(m.opstack.peek(-2));
  });

  // 3 pop pop pops
  d.addCoreFunc("ROT", (m: Machine) => m.opstack.push(m.opstack.pop(-3)));

  // 4 pop pop skip skip
  d.addCoreFunc("2OVER", (m: Machine) => {
    m.opstack.push(m.opstack.peek(-4));
    m.opstack.push(m.opstack.peek(-4));
  });

  d.addCoreFunc("2SWAP", (m: Machine) => {
    m.opstack.push(m.opstack.pop(-4)); // 1234 -> 2341
    m.opstack.push(m.opstack.pop(-4)); // 2341 -> 3412
  });

  return true;
};
