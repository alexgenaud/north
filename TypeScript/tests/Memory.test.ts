import Data from "../north/Data";
import Memory from "../north/Memory";
import { DataType } from "../north/types";

describe("Memory", () => {
    let memory: Memory;

    beforeEach(() => {
        memory = new Memory(10);
    });

    test("read and write values", () => {
        memory.write(new Data(42, DataType.integer), 0);
        memory.write(new Data(142, DataType.integer), 7);
        memory.write(new Data(19, DataType.integer));

        expect(memory.read(0).isInt()).toBe(true);
        expect(memory.read(0).getValue()).toBe(42);

        expect(memory.read(6)).toBe(undefined); // no Data initialized

        expect(memory.read(7).isInt()).toBe(true);
        expect(memory.read(7).getValue()).toBe(142);

        expect(memory.read(8).isCoreFunc()).toBe(false);
        expect(memory.read(8).isColonFunc()).toBe(false);
        expect(memory.read(8).isConditionFunc()).toBe(false);
        expect(memory.read(8).isImmediateFunc()).toBe(false);
        expect(memory.read(8).isInt()).toBe(true);
        expect(memory.read(8).getValue()).toBe(19);
    });
});
