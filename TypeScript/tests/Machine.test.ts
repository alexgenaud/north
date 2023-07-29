import { INTERPRET } from "../north/parse/INTERPRET";
import { BasicArgTwo } from "../north/core/BasicArgTwo";
import Machine from "../north/Machine";

describe("Machine", () => {
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

  test("add_simple", () => {
    assertExecuteStack("2 3 +", "5");
  });

  test("execute_none", () => {
    const strInput: any = null;
    expect(() => {
      machine.executeInputBuffer(strInput);
    }).toThrow("non-null");
  });

  test("execute_empty", () => {
    assertExecuteStack("", "");
  });

  test("execute_blank", () => {
    assertExecuteStack("   ", "");
  });

  /*
     * TODO need to separate parsers (compile) from interpret
    test.only('execute_bogus', () => {
        assertExecuteStack("BoGuS", "");
        expect(() => {
            machine.executeInputBuffer("BoGuS");
        }).toThrow("non-null")
     });
    */

  test("machine_execute_push", () => {
    assertExecutePop("1", 1);
  });

  test("should throw an error when dividing by zero", () => {
    machine.opstack.push(10);
    machine.opstack.push(0);
    const divInt = machine.dictionary.getAction("/")?.getValue() as Function;
    expect(() => {
      divInt(machine);
    }).toThrowError("non-zero");
  });

  test("should throw an error when numerator not a number", () => {
    machine.opstack.push("ABC");
    machine.opstack.push(7);
    const divInt = machine.dictionary.getAction("/")?.getValue() as Function;
    expect(() => {
      divInt(machine);
    }).toThrowError("integer");
  });
});
