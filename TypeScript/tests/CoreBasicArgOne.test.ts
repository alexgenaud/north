import Machine from "../north/Machine";
import { INTERPRET } from "../north/parse/INTERPRET";
import { BasicArgOne } from "../north/core/BasicArgOne";

describe("core/BasicArgOne", () => {
  let machine: Machine;

  beforeEach(() => {
    machine = new Machine();
    expect(machine.load([INTERPRET, BasicArgOne])).toBe(true);
  });

  const assertExecuteStack = (execStr: string, expectStack: string) => {
    machine.executeInputBuffer(execStr);
    expect(machine.opstack.toString()).toBe(expectStack);
  };

  const assertExecutePop = (execStr: string, expectPop: number) => {
    machine.executeInputBuffer(execStr);
    expect(machine.opstack.pop()).toBe(expectPop);
  };

  test("drop", () => {
    assertExecuteStack("8 6 4 DROP", "8 6");
  });

  test("dup", () => {
    assertExecuteStack("8 7 DUP", "8 7 7");
    assertExecuteStack("-7 DUP", "8 7 7 -7 -7");
  });

  test("not_simple", () => {
    assertExecutePop("0 NOT", -1);
    assertExecutePop("1 NOT", -2);
    assertExecutePop("5 NOT", -6);
    assertExecutePop("127 NOT", -128);
  });

  test("not mix", () => {
    assertExecuteStack("8 0 NOT", "8 -1");
    assertExecuteStack("DROP DROP 0 DROP 1 NOT", "-2");
    assertExecutePop("256 NOT", -257);
    assertExecutePop("1234567890 NOT", -1234567891);
  });

  test("abs", () => {
    assertExecutePop("10 ABS", 10);
    assertExecutePop("1 ABS", 1);
    assertExecutePop("0 ABS", 0);
    assertExecutePop("-1 ABS", 1);
    assertExecutePop("-10 ABS", 10);
  });

  test("logical_less_than_zero", () => {
    assertExecutePop("-1 <0", 1);
    assertExecutePop("0 <0", 0);
    assertExecutePop("1 <0", 0);
  });

  test("logical_equal_zero", () => {
    assertExecuteStack("0 =0", "1");
    assertExecuteStack("=0", "0");
    assertExecutePop("=0", 1);
    assertExecuteStack("", "");
    assertExecutePop("0 =0", 1);
    assertExecutePop("1 =0", 0);
    assertExecutePop("-6 =0", 0);
  });

  test("logical_greater_than_zero", () => {
    assertExecutePop("-1 >0", 0);
    assertExecutePop("0 >0", 0);
    assertExecutePop("1 >0", 1);
  });

  test("logical_greater_equal_zero", () => {
    assertExecutePop("-1 >=0", 0);
    assertExecutePop("0 >=0", 1);
    assertExecutePop("1 >=0", 1);
  });
});
