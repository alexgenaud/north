import Machine from '../north/Machine';
import { wordsMany } from '../north/WordsMany';
import { wordsOptimised } from '../north/WordsOptimised';
import { INTERPRET } from '../north/parse/INTERPRET';
import { VAR } from '../north/parse/VAR';

describe('parse/VAR', () => {
    let machine: Machine;

    beforeEach(() => {
        machine = new Machine();
        expect(machine.load([INTERPRET, VAR])).toBe(true);
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

    test("new_variable", () => {
        assertExecutePop("VAR six six @", 0); // 0 unset value
        assertExecutePop("7 six ! six @", 7);
        assertExecuteStack("six @ 1 - six ! six @", "6");
    });

    test("new_var_meton_example", () => {
        // VAR meton addressA-> 0, addressB->B, "meton"->addressB
        assertExecutePop("VAR meton 235 meton ! meton @", 235); // 0 unset value
    });

});


