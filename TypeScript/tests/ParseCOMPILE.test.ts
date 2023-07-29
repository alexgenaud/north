import { INTERPRET } from "../north/parse/INTERPRET";
import { COMPILE } from "../north/parse/COMPILE";
import { BasicArgOne } from "../north/core/BasicArgOne";
import { BasicArgTwo } from "../north/core/BasicArgTwo";
import Machine from "../north/Machine";

describe("parse/COMPILE", () => {
  let machine: Machine;

  beforeEach(() => {
    machine = new Machine();
    expect(machine.load([INTERPRET, COMPILE, BasicArgOne, BasicArgTwo])).toBe(
      true,
    );
  });

  const assertExecuteStack = (execStr: string, expectStack: string) => {
    machine.executeInputBuffer(execStr);
    expect(machine.opstack.toString()).toBe(expectStack);
  };

  const assertExecutePop = (execStr: string, expectPop: number) => {
    machine.executeInputBuffer(execStr);
    expect(machine.opstack.pop()).toBe(expectPop);
  };

  test("compile_number_no_definition", () => {
    assertExecuteStack(": 7 ;", ""); // word name 7 with no definition
    assertExecuteStack("7", ""); // execute 7 does nothing
    assertExecuteStack("5", "5"); // whereas number 5 pushes 5 to stack
  });

  test("compile_nothing", () => {
    assertExecuteStack(": ;", ""); // compile no name, no def
  });

  test("compile_replace_number", () => {
    assertExecuteStack(": 3 2 ;", ""); // word name 3 with 2 def
    assertExecutePop("3", 2); // execute 3 gives 2
    assertExecutePop("2", 2); // 2 untouched
  });

  test("define_word_neg_define_and_run_7_neg", () => {
    assertExecutePop(": NEG 0 SWAP - ; 7 NEG", -7);
  });

  test("define_word_neg_just_define", () => {
    assertExecuteStack(": NEG 0 SWAP - ;", "");
  });

  test("define_word_neg_push_define_neg_after", () => {
    assertExecutePop("5 : NEG 0 SWAP - ; NEG", -5);
  });

  test("define_word_neg_prior_one_command", () => {
    assertExecutePop("3 : NEG 0 SWAP - ; NEG", -3);
  });

  test("overwrite_same_colon_word_inner_old", () => {
    assertExecuteStack(": X 7 +     ; 1 X", "8");
    assertExecuteStack(": X X 100 + ; 0 X", "8 107");
    assertExecuteStack(": X X  10 + ; 0 X", "8 107 117");
    assertExecuteStack(": X DROP    ; X", "8 107");
  });

  /*
    test('program_is_prime', () => {
        assertExecuteStack("""
            : IS_PRIME DUP 2 <= IF DROP 0 ELSE
               DUP 3 <= IF DROP 1 ELSE
                 DUP 2 1 + 3 DO
                   DUP I MOD 0 = IF DROP 0 EXIT THEN
                 LOOP THEN THEN ;
            4 IS_PRIME
            ""","[0]")
    });
    */

  test("redefine_dup_to_square", () => {
    assertExecuteStack("5 DUP", "5 5");
    assertExecuteStack(": OLD_DUP DUP ; 4 OLD_DUP", "5 5 4 4");
    assertExecuteStack(": DUP DUP * ; 13 DUP", "5 5 4 4 169");
    assertExecuteStack("1 OLD_DUP", "5 5 4 4 169 1 1");
  });

  test("new_word_of_primitive", () => {
    assertExecuteStack("5 DUP", "5 5");
    assertExecuteStack(": SQUARE DUP * ; SQUARE", "5 25");
  });
});
