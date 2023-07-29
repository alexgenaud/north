import Interpreter from "../north/Interpreter";

describe("Interpreter", () => {
  let interpreter: Interpreter;

  beforeEach(() => {
    interpreter = new Interpreter();
  });

  const assertExecuteStack = (execStr: string, expectStack: string) => {
    interpreter.execute(execStr);
    expect(interpreter.machine.opstack.toString()).toBe(expectStack);
  };

  const assertExecutePop = (execStr: string, expectPop: number) => {
    interpreter.execute(execStr);
    expect(interpreter.machine.opstack.pop()).toBe(expectPop);
  };

  test("separate_input_one_same_stack", () => {
    assertExecuteStack("2 3 +", "5");
    assertExecuteStack("7", "5 7");
    assertExecutePop("*", 35);
    assertExecuteStack("     ", "");
  });

  test("execute_empty", () => {
    assertExecuteStack("", "");
  });

  test("execute_blank", () => {
    assertExecuteStack("   ", "");
  });

  test("define_word_neg_define_and_run_7_neg", () => {
    assertExecutePop(": NEG 0 SWAP - ; 7 NEG", -7);
  });

  test("define_multiple_and_overwrite", () => {
    assertExecuteStack(": NEG 0 SWAP - ;", "");
    assertExecuteStack(": X 7 +     ; 1 X", "8");
    assertExecuteStack(": X X 100 + ; 0 X", "8 107");
    assertExecuteStack(": X X  10 + ; 0 X", "8 107 117");
    assertExecuteStack(": X DROP    ; X", "8 107");
  });
});
