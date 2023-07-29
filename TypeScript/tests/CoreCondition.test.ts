import Machine from "../north/Machine";
import { INTERPRET } from "../north/parse/INTERPRET";
import { COMPILE } from "../north/parse/COMPILE";
import { BasicArgOne } from "../north/core/BasicArgOne";
import { BasicArgTwo } from "../north/core/BasicArgTwo";
import { Condition } from "../north/core/Condition";

describe("CoreCondition", () => {
  let machine: Machine;

  beforeEach(() => {
    machine = new Machine();
    expect(
      machine.load([INTERPRET, COMPILE, BasicArgOne, BasicArgTwo, Condition]),
    ).toBe(true);
  });

  const assertExecuteStack = (execStr: string, expectStack: string) => {
    machine.executeInputBuffer(execStr);
    expect(machine.opstack.toString()).toBe(expectStack);
  };

  const assertExecutePop = (execStr: string, expectPop: number) => {
    machine.executeInputBuffer(execStr);
    expect(machine.opstack.pop()).toBe(expectPop);
  };

  test("if_simple", () => {
    assertExecutePop("1 IF 2 ELSE 3 THEN", 2);
    assertExecuteStack("1 IF ELSE 3 THEN", "");
    assertExecutePop("1 IF 2 THEN", 2);
    assertExecutePop("-1 IF 2 ELSE 3 THEN", 2);
    assertExecutePop("0 IF ELSE 3 THEN", 3);
    assertExecuteStack("2 IF 2 THEN", "2");
  });

  test("if_else_then_example_if", () => {
    assertExecutePop(": IS_NOT_ZERO DUP IF 7 ELSE 9 THEN ; 0 IS_NOT_ZERO", 9);
    assertExecutePop("1 IS_NOT_ZERO", 7);
    assertExecutePop("7 IS_NOT_ZERO", 7);
    assertExecutePop("-1 IS_NOT_ZERO", 7);
    assertExecutePop("0 IS_NOT_ZERO", 9);
  });

  test("if_else_then_example_if", () => {
    assertExecutePop(": IS_NOT_ZERO DUP IF 7 ELSE 9 THEN ; 0 IS_NOT_ZERO", 9);
    assertExecutePop("1 IS_NOT_ZERO", 7);
    assertExecutePop("7 IS_NOT_ZERO", 7);
    assertExecutePop("-1 IS_NOT_ZERO", 7);
    assertExecutePop("0 IS_NOT_ZERO", 9);
  });

  test("if_else_then_dup", () => {
    assertExecutePop(": IS_TEN DUP 10 = IF 3 ELSE 4 THEN ; 0 IS_TEN", 4);
    assertExecutePop("-1 IS_TEN", 4);
    assertExecutePop("0 IS_TEN", 4);
    assertExecutePop("1 IS_TEN", 4);
    assertExecutePop("10 IS_TEN", 3);
    assertExecutePop("11 IS_TEN", 4);
  });

  test("if_absolute_else", () => {
    assertExecutePop(": E_ABS DUP >=0 IF ELSE 0 SWAP - THEN ; 6 E_ABS", 6);
    assertExecutePop("-1 E_ABS", 1);
    assertExecutePop("0 E_ABS", 0);
    assertExecutePop("4 E_ABS", 4);
    assertExecutePop("-7 E_ABS", 7);
  });

  test("if_nested", () => {
    assertExecuteStack(
      ": IS_SIX DUP <0 IF DROP 0 ELSE DUP >0 IF 6 = IF 1 ELSE 0 THEN ELSE DROP 0 THEN THEN ;",
      "",
    );
    assertExecutePop("-6 IS_SIX", 0);
    assertExecutePop("0 IS_SIX", 0);
    assertExecutePop("1 IS_SIX", 0);
    assertExecutePop("5 IS_SIX", 0);
    assertExecutePop("6 IS_SIX", 1);
    assertExecuteStack("7 IS_SIX", "0");
  });

  test("if_absolute_no_else", () => {
    assertExecutePop(": M_ABS DUP <0 IF 0 SWAP - THEN ; 6 M_ABS", 6);
    assertExecutePop("-1 M_ABS", 1);
    assertExecutePop("0 M_ABS", 0);
    assertExecutePop("4 M_ABS", 4);
    assertExecutePop("-7 M_ABS", 7);
  });

  test("if_multiple", () => {
    assertExecutePop("1 IF 2 ELSE 3 THEN", 2);
    assertExecuteStack("1 IF ELSE 3 THEN", "");
    assertExecutePop("1 IF 2 THEN", 2);
    assertExecutePop("-1 IF 2 ELSE 3 THEN", 2);
    assertExecutePop("0 IF ELSE 3 THEN", 3);
    assertExecuteStack("2 IF 2 THEN", "2");
  });

  test("if_new_definition", () => {
    assertExecutePop(": IS_TEN DUP 10 = IF 3 ELSE 4 THEN ; 0 IS_TEN", 4);
    assertExecutePop("-1 IS_TEN", 4);
    assertExecutePop("10 IS_TEN", 3);
  });
});
