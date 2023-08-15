import Machine from "../north/Machine";
import { INTERPRET } from "../north/parse/INTERPRET";
import { COMPILE } from "../north/parse/COMPILE";
import { BasicArgOne } from "../north/core/BasicArgOne";
import { BasicArgTwo } from "../north/core/BasicArgTwo";
import { Loop } from "../north/core/Loop";
import { Jump } from "../north/core/Jump";

describe("CoreLoop", () => {
  let machine: Machine;

  beforeEach(() => {
    machine = new Machine();
    expect(
      machine.load([INTERPRET, COMPILE, BasicArgOne, BasicArgTwo, Loop, Jump]),
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

  test("begin_until", () => {
    assertExecuteStack(": X BEGIN DUP 1 - DUP =0 UNTIL ;", "");
    assertExecuteStack("5 X", "5 4 3 2 1 0");
  });

  test("begin_blank_until", () => {
    // expect(1 + 1).toBe(2); // dummy placeholder
    // assertExecuteStack("BEGIN 1 UNTIL", "1"); // interpretation throws error
    assertExecuteStack(": X 11 DROP ; X", "");
    assertExecuteStack(": Y 12 BEGIN UNTIL ; Y", "");
    assertExecuteStack(": Z BEGIN 13 UNTIL ; Z", "");
  });

  test("begin_number_until", () => {
    assertExecutePop(": V BEGIN 9 1 UNTIL ; V", 9);
    assertExecuteStack(": W BEGIN 9 UNTIL ; W", "");
  });

  test("do_loop_empty", () => {
    assertExecuteStack(": DONOTHING 9 0 DO LOOP ; DONOTHING", "");
  });

  test("do_loop_three", () => {
    assertExecuteStack(": THREE 3 0 DO 5 LOOP ; THREE", "5 5 5");
  });

  test("do_loop_three_i", () => {
    assertExecuteStack(": THREE 3 0 DO I LOOP ; THREE", "0 1 2");
  });

  test("do_loop_i_j_k", () => {
    assertExecuteStack(
      ": ALL 2 0 DO 5 3 DO 8 6 DO I J K LOOP LOOP LOOP ; ALL",
      "6 3 0 7 3 0 6 4 0 7 4 0 6 3 1 7 3 1 6 4 1 7 4 1",
    );
  });

  test("do_loop_fib", () => {
    assertExecuteStack(
      ": FIB 0 1 ROT 0 DO 2DUP + LOOP ; 9 FIB",
      "0 1 1 2 3 5 8 13 21 34 55",
    );
  });

  test("do_loosey_fib", () => {
    assertExecuteStack(
      ": LOOSEY 0 1 ROT 0 DO 2DUP + ROT DROP LOOP SWAP DROP ; 15 LOOSEY",
      "987",
    );
  });
});
