import Machine from "../north/Machine";
import { INTERPRET } from "../north/parse/INTERPRET";
import { COMPILE } from "../north/parse/COMPILE";
import { Jump } from "../north/core/Jump";

describe("CoreJump", () => {
  let machine: Machine;

  beforeEach(() => {
    machine = new Machine();
    expect(machine.load([INTERPRET, COMPILE, Jump])).toBe(true);
  });

  const assertExecuteStack = (execStr: string, expectStack: string) => {
    machine.executeInputBuffer(execStr);
    expect(machine.opstack.toString()).toBe(expectStack);
  };

  const assertExecutePop = (execStr: string, expectPop: number) => {
    machine.executeInputBuffer(execStr);
    expect(machine.opstack.pop()).toBe(expectPop);
  };

  test("jump_mandatory", () => {
    assertExecuteStack(": EX2 9 8 JMP 31 32 33 ; EX2", "9 33");
  });

  test("jump_if_zero", () => {
    assertExecutePop(":   EX2 0 8 J=0 31 32 33 ; EX2", 33);
    assertExecuteStack(": EX3 7 8 J=0 31 32 33 ; EX3", "31 32 33");
  });
});
