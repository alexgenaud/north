import Machine from "../north/Machine";
import { INTERPRET } from "../north/parse/INTERPRET";
import { COMPILE } from "../north/parse/COMPILE";
import { BasicArgOne } from "../north/core/BasicArgOne";
import { BasicArgTwo } from "../north/core/BasicArgTwo";
import { Condition } from "../north/core/Condition";
import { Jump } from "../north/core/Jump";

describe("CoreCondition", () => {
  let machine: Machine;

  beforeEach(() => {
    machine = new Machine();
    expect(
      machine.load([
        INTERPRET,
        COMPILE,
        BasicArgOne,
        BasicArgTwo,
        Condition,
        Jump,
      ]),
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

  test("if_simple_interpret", () => {
    assertExecutePop("1 IF 2 ELSE 3 THEN", 2);
  });

  test("if_simple_compile", () => {
    assertExecutePop(": X 1 IF 2 ELSE 3 THEN ; X", 2);
  });

  test("empty_condition_blocks_interpret", () => {
    assertExecuteStack("13 IF ELSE THEN", "");
    assertExecutePop("5 6 0 IF ELSE THEN +", 11);
    assertExecuteStack("17 IF ELSE THEN", "");
  });

  test("empty_condition_blocks_compile", () => {
    assertExecuteStack(": EMPTY IF ELSE THEN ; 13 EMPTY", "");
    assertExecutePop("5 6 0 EMPTY +", 11);
    assertExecuteStack("17 EMPTY", "");
  });

  test("nested_empty_conditions", () => {
    assertExecuteStack(": MTEE IF IF ELSE THEN ELSE IF ELSE THEN THEN ;", "");
    assertExecutePop("7 0 0 MTEE", 7);
    assertExecutePop("7 0 1 MTEE", 7);
    assertExecutePop("7 1 0 MTEE", 7);
    assertExecutePop("7 1 1 MTEE", 7);
  });

  test("nested_empty_conditions_interpret", () => {
    assertExecutePop("7 0 0 IF IF ELSE THEN ELSE IF ELSE THEN THEN", 7);
    assertExecutePop("7 0 1 IF IF ELSE THEN ELSE IF ELSE THEN THEN", 7);
    assertExecutePop("7 1 0 IF IF ELSE THEN ELSE IF ELSE THEN THEN", 7);
    assertExecutePop("7 1 1 IF IF ELSE THEN ELSE IF ELSE THEN THEN", 7);
  });

  test("if_simple_extra_interpret", () => {
    assertExecuteStack("1 IF ELSE 3 THEN", "");
    assertExecutePop("1 IF 2 THEN", 2);
    assertExecutePop("-1 IF 2 ELSE 3 THEN", 2);
    assertExecutePop("0 IF ELSE 3 THEN", 3);
    assertExecuteStack("0 IF 2 THEN", "");
  });

  test("if_simple_extra_compile", () => {
    assertExecuteStack("1 : X IF ELSE 3 THEN ; X", "");
    assertExecutePop("1 : X IF 2 THEN ; X", 2);
    assertExecutePop("-1 : X IF 2 ELSE 3 THEN ; X", 2);
    assertExecutePop("0 : X IF ELSE 3 THEN ; X", 3);
    assertExecuteStack("0 : X IF 2 THEN ; X", "");
  });

  test("if_else_then_example_if_interpret", () => {
    assertExecutePop("0 IF 7 ELSE 9 THEN", 9);
    assertExecutePop("1 IF 7 ELSE 9 THEN", 7);
    assertExecutePop("7 IF 7 ELSE 9 THEN", 7);
    assertExecutePop("-1 IF 7 ELSE 9 THEN", 7);
    assertExecutePop("0 IF 7 ELSE 9 THEN", 9);
  });

  test("if_else_then_example_if_compile", () => {
    assertExecutePop(": IS_NOT_ZERO IF 7 ELSE 9 THEN ; 0 IS_NOT_ZERO", 9);
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

  test("nest_condition_once", () => {
    assertExecuteStack(": DIGITS 10 < IF 1 ELSE 2 THEN ;", "");
    assertExecutePop("3 DIGITS", 1);
    assertExecutePop("314 DIGITS", 2);
  });

  test("nest_condition_twice", () => {
    assertExecutePop(
      "9 DUP 10 < IF 1 ELSE DUP 100 < IF 2 ELSE 3 THEN THEN SWAP DROP",
      1,
    );
    assertExecutePop(
      "89 DUP 10 < IF 1 ELSE DUP 100 < IF 2 ELSE 3 THEN THEN SWAP DROP",
      2,
    );
    assertExecutePop(
      "789 DUP 10 < IF 1 ELSE DUP 100 < IF 2 ELSE 3 THEN THEN SWAP DROP",
      3,
    );

    assertExecuteStack(": DIGITS DUP 10 < IF 1 ELSE DUP 100 < IF 2", "");
    assertExecuteStack("         ELSE 3 THEN THEN SWAP DROP ;", "");
    assertExecutePop("5 DIGITS", 1);
    assertExecutePop("54 DIGITS", 2);
    assertExecutePop("543 DIGITS", 3);
  });

  test("nest_many_if_lines", () => {
    assertExecuteStack(": DIGITS DUP 10 < IF 1 ELSE DUP 100 < IF 2 ELSE", "");
    assertExecuteStack("         DUP 1000 < IF 3 ELSE", "");
    assertExecuteStack("         DUP 10000 < IF 4 ELSE", "");
    assertExecuteStack("         DUP 100000 < IF 5 ELSE 6", "");
    assertExecuteStack("THEN THEN THEN THEN THEN SWAP DROP ;", "");
    assertExecutePop("5 DIGITS", 1);
    assertExecutePop("54 DIGITS", 2);
    assertExecutePop("543 DIGITS", 3);
    assertExecutePop("5432 DIGITS", 4);
    assertExecutePop("54321 DIGITS", 5);
    assertExecutePop("543210 DIGITS", 6);
  });
});
