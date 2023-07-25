import Machine from '../north/Machine';
import { wordsMany } from '../north/WordsMany';
import { wordsOptimised } from '../north/WordsOptimised';
import { INTERPRET } from '../north/parse/INTERPRET';
import { CONST } from '../north/parse/CONST';

describe('parse/CONST', () => {
    let machine: Machine;

    beforeEach(() => {
        machine = new Machine();
        expect(machine.load([INTERPRET, CONST])).toBe(true);
        expect(machine.load([wordsMany, wordsOptimised])).toBe(true);
    });

    const assertExecuteStack = (execStr: string, expectStack: string) => {
        machine.executeInputBuffer(execStr);
        expect(machine.opstack.toString()).toBe(expectStack);
    };

    const assertExecutePop = (execStr: string, expectPop: number) => {
        machine.executeInputBuffer(execStr);
        expect(machine.opstack.pop()).toBe(expectPop);
    };

    test("new_constant", () => {
        assertExecutePop("5 CONST five 15 five /", 3);
        assertExecuteStack(
            "5 CONST five 314 CONST Pi100 35 five / Pi100 100 /",
            "7 3"
        );
        assertExecutePop("* 1 + 100 * Pi100 /", 7); // 22 / 3.14 > 7
    });

    test("new_constant_days_julian_cal_century", () => {
        assertExecutePop(
            "36525 CONST DAYS_JULI_CENT 365 100 * 100 4 / + DAYS_JULI_CENT =",
            1
        );
        assertExecutePop(
            "36522 CONST DAYS_GREG_CENT DAYS_JULI_CENT DAYS_GREG_CENT -",
            3
        );
    });


});


