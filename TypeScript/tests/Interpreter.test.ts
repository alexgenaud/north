import Interpreter from '../north/Interpreter';

describe('Interpreter', () => {
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

    test('separate_input_one_same_stack', () => {
        assertExecuteStack('2 3 +', '5');
        assertExecuteStack('7', '5 7');
        assertExecutePop('*', 35);
        assertExecuteStack('     ', '');
    });

    test('if_multiple', () => {
        assertExecutePop('1 IF 2 ELSE 3 THEN', 2);
        assertExecuteStack('1 IF ELSE 3 THEN', '');
        assertExecutePop('1 IF 2 THEN', 2);
        assertExecutePop('-1 IF 2 ELSE 3 THEN', 2);
        assertExecutePop('0 IF ELSE 3 THEN', 3);
        assertExecuteStack('2 IF 2 THEN', '2');
    });

    test('if_new_definition', () => {
        assertExecutePop(": IS_TEN DUP 10 = IF 3 ELSE 4 THEN ; 0 IS_TEN", 4)
        assertExecutePop("-1 IS_TEN", 4)
        assertExecutePop("10 IS_TEN", 3)
    });

    test('execute_empty', () => {
        assertExecuteStack("", "");
    });

    test('execute_blank', () => {
        assertExecuteStack("   ", "");
    });

    test('define_word_neg_define_and_run_7_neg', () => {
        assertExecutePop(": NEG 0 SWAP - ; 7 NEG", -7)
    });

    test('define_multiple_and_overwrite', () => {
        assertExecuteStack(": NEG 0 SWAP - ;", "")
        assertExecuteStack(": X 7 +     ; 1 X",     "8")
        assertExecuteStack(": X X 100 + ; 0 X", "8 107")
        assertExecuteStack(": X X  10 + ; 0 X", "8 107 117")
        assertExecuteStack(": X DROP    ; X",      "8 107")
    });

    test('new_variable', () => {
        assertExecutePop("VAR six six @", 0); // 0 unset value
        assertExecutePop("7 six ! six @", 7);
        assertExecuteStack("six @ 1 - six ! six @", "6");
    });

});

