import Machine from "../north/Machine";
import { INTERPRET } from "../north/parse/INTERPRET";
import { BasicArgTwo } from "../north/core/BasicArgTwo";

describe("core/BasicArgTwo", () => {
  let machine: Machine;

  beforeEach(() => {
    machine = new Machine();
    expect(machine.load([INTERPRET, BasicArgTwo])).toBe(true);
  });

  const assertExecuteStack = (execStr: string, expectStack: string) => {
    machine.executeInputBuffer(execStr);
    expect(machine.opstack.toString()).toBe(expectStack);
  };

  const assertExecutePop = (execStr: string, expectPop: number) => {
    machine.executeInputBuffer(execStr);
    expect(machine.opstack.pop()).toBe(expectPop);
  };

  test("add_negatives", () => {
    assertExecuteStack("2 3 +", "5");
    assertExecutePop("-3 +", 2);
    assertExecutePop("-13 -11 +", -24);
    assertExecutePop("3 -7 +", -4);
    assertExecutePop("-7 3 +", -4);
    assertExecutePop("-3 7 +", 4);
    assertExecutePop("7 -3 +", 4);
  });

  test("logical_or", () => {
    assertExecutePop("1 0 OR", 1);
    assertExecutePop("1 2 OR", 3);
    assertExecutePop("2 2 OR", 2);
    assertExecutePop("27 8 OR", 27);
    assertExecutePop("7 5 OR", 7);
    assertExecutePop("11 15 OR", 15);
  });

  test("logical_xor", () => {
    assertExecutePop("0 0 XOR", 0);
    assertExecutePop("1 0 XOR", 1);
    assertExecutePop("1 2 XOR", 3);
    assertExecutePop("2 2 XOR", 0);
    assertExecutePop("2 3 XOR", 1);
    assertExecutePop("7 5 XOR", 2);
  });

  test("logical_and", () => {
    assertExecutePop("1 0 AND", 0);
    assertExecutePop("1 2 AND", 0);
    assertExecutePop("2 2 AND", 2);
    assertExecutePop("27 8 AND", 8);
    assertExecutePop("7 5 AND", 5);
    assertExecutePop("11 15 AND", 11);
  });

  test("compare_two_equal", () => {
    assertExecutePop("0 0 =", 1);
    assertExecutePop("-1 -1 =", 1);
    assertExecutePop("1 0 =", 0);
    assertExecutePop("0 1 =", 0);
    assertExecutePop("-1 1 =", 0);
  });

  test("compare_two_less_than", () => {
    assertExecutePop("0 0 <", 0);
    assertExecutePop("0 1 <", 1);
    assertExecutePop("1 0 <", 0);
    assertExecutePop("1 1 <", 0);
    assertExecutePop("-1 0 <", 1);
    assertExecutePop("-1 -2 <", 0);
  });

  test("compare_two_greater_than", () => {
    assertExecutePop("0 0 >", 0);
    assertExecutePop("0 1 >", 0);
    assertExecutePop("1 0 >", 1);
    assertExecutePop("1 1 >", 0);
    assertExecutePop("-1 0 >", 0);
    assertExecutePop("-1 -2 >", 1);
  });

  test("over", () => {
    assertExecuteStack("5 6 7 OVER", "5 6 7 6");
  });

  test("rotate", () => {
    assertExecuteStack("3 4 5 6 7 ROT", "3 4 6 7 5");
  });

  test("swap_one_line_7_9_swap", () => {
    assertExecuteStack("7 9 SWAP", "9 7");
  });

  test("swap_push2_execute", () => {
    assertExecuteStack("5 8 SWAP", "8 5");
  });

  test("add_one_line", () => {
    assertExecutePop("19 3 4 +", 7);
  });

  test("add_push2_execute_plus", () => {
    assertExecutePop("5 8 +", 13);
  });

  test("subtract_simple", () => {
    assertExecutePop("9 6 -", 3);
    assertExecutePop("9 16 -", -7);
  });

  test("subtract_negative_one_liner", () => {
    assertExecutePop("7 11 -", -4);
  });

  test("subtract_push2_execute_subtract", () => {
    assertExecutePop("9 6 -", 3);
  });

  test("machine_multiply", () => {
    assertExecutePop("3 5 *", 15);
  });

  test("divide_int", () => {
    assertExecutePop("6 7 /", 0);
    assertExecutePop("6 6 /", 1);
    assertExecutePop("6 5 /", 1);
    assertExecutePop("6 3 /", 2);
    assertExecutePop("6 2 /", 3);
    assertExecutePop("6 1 /", 6);
  });

  test("divide_negatives", () => {
    assertExecutePop("-6 3 /", -2);
    assertExecutePop("-5 3 /", -2);
    assertExecutePop("-4 3 /", -2);
    assertExecutePop("-3 3 /", -1);
    assertExecutePop("-2 3 /", -1);
    assertExecutePop("-1 3 /", -1);
    assertExecutePop("-1 3 /", -1);
    assertExecutePop("0 3 /", 0);
    assertExecutePop("1 3 /", 0);
    assertExecutePop("2 3 /", 0);
    assertExecutePop("3 3 /", 1);
    assertExecutePop("4 3 /", 1);
    assertExecutePop("5 3 /", 1);
    assertExecutePop("6 3 /", 2);
  });

  test("divide_by_zero", () => {
    machine.executeInputBuffer("13");
    machine.executeInputBuffer("0");
    expect(() => {
      machine.executeInputBuffer("/");
    }).toThrow("non-zero");
  });

  test("mod", () => {
    assertExecutePop("10 5 MOD", 0);
    assertExecutePop("13 12 MOD", 1);

    assertExecutePop("10 -5 MOD", 0);
    assertExecutePop("13 -12 MOD", 1);

    // # Negative dividend
    assertExecutePop("-10 5 MOD", 0);
    assertExecutePop("-13 12 MOD", 11);

    // # Negative divisor
    assertExecutePop("-10 -5 MOD", 0);
    assertExecutePop("-13 -12 MOD", 11);

    // # Zero dividend
    assertExecutePop("0 5 MOD", 0);
    assertExecutePop("0 12 MOD", 0);

    machine.executeInputBuffer("0");
    machine.executeInputBuffer("5");
    machine.executeInputBuffer("MOD");
    expect(machine.opstack.pop()).toBe(0);
  });

  test("mod_by_zero", () => {
    machine.executeInputBuffer("5");
    machine.executeInputBuffer("0");
    expect(() => {
      machine.executeInputBuffer("MOD");
    }).toThrow("non-zero");
  });
});
