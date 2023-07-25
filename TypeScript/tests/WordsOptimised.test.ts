import Machine from '../north/Machine';
import { wordsOptimised } from '../north/WordsOptimised';

describe('WordsOptimised', () => {
    let machine: Machine;

    beforeEach(() => {
        machine = new Machine();
        expect(machine.load([wordsOptimised])).toBe(true);
    });

    const assertExecuteStack = (execStr: string, expectStack: string) => {
        for (const token of execStr.trim().split(/\s+/)) {
            machine.execute(token);
        }
        expect(machine.opstack.toString()).toBe(expectStack);
    };

    const assertExecutePop = (execStr: string, expectPop: number) => {
        for (const token of execStr.trim().split(/\s+/)) {
            machine.execute(token);
        }
        expect(machine.opstack.pop()).toBe(expectPop);
    };

    test('word_missing_before_load', () => {
        assertExecutePop("0 NOT", -1);
        assertExecutePop("1 NOT", -2);
        assertExecutePop("5 NOT", -6);
        assertExecutePop("127 NOT", -128);
    });

    test('not', () => {
        assertExecuteStack("8 0 NOT", "8 -1")
        assertExecuteStack("DROP DROP 0 DROP 1 NOT", "-2")
        assertExecutePop("256 NOT", -257)
        assertExecutePop("1234567890 NOT", -1234567891)
    });

    test('abs', () => {
        assertExecutePop("10 ABS", 10)
        assertExecutePop("1 ABS", 1)
        assertExecutePop("0 ABS", 0)
        assertExecutePop("-1 ABS", 1)
        assertExecutePop("-10 ABS", 10)
    });

    test('if_nested', () => {
        assertExecuteStack(": IS_SIX DUP <0 IF DROP 0 ELSE DUP >0 IF 6 = IF 1 ELSE 0 THEN ELSE DROP 0 THEN THEN ;", "")
        assertExecutePop("-6 IS_SIX", 0)
        assertExecutePop("0 IS_SIX", 0)
        assertExecutePop("1 IS_SIX", 0)
        assertExecutePop("5 IS_SIX", 0)
        assertExecutePop("6 IS_SIX", 1)
        assertExecuteStack("7 IS_SIX", "0")
    });

    test('if_absolute_no_else', () => {
        assertExecutePop(": M_ABS DUP <0 IF 0 SWAP - THEN ; 6 M_ABS", 6)
        assertExecutePop("-1 M_ABS", 1)
        assertExecutePop("0 M_ABS", 0)
        assertExecutePop("4 M_ABS", 4)
        assertExecutePop("-7 M_ABS", 7)
    });

    test('logical_less_than_zero', () => {
        assertExecutePop("-1 <0", 1)
        assertExecutePop("0 <0", 0)
        assertExecutePop("1 <0", 0)
    });

    test('logical_equal_zero', () => {
        assertExecuteStack("0 =0", "1")
        assertExecuteStack("=0", "0")
        assertExecutePop("=0", 1)
        assertExecuteStack("", "")
        assertExecutePop("0 =0", 1)
        assertExecutePop("1 =0", 0)
        assertExecutePop("-6 =0", 0)
    });

    test('logical_greater_than_zero', () => {
        assertExecutePop("-1 >0", 0)
        assertExecutePop("0 >0", 0)
        assertExecutePop("1 >0", 1)
    });


});

