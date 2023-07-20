import Data from "../north/Data";
import Memory from "../north/Memory";
import { DataType } from "../north/types";

    function assertEqual(actual: any, expect: any, msg: string) {
        try {
        expect(actual).toEqual(expect);
        } catch (e) {
            console.error("actual: " + actual +", expect: " + expect +" msg: "+ msg);
        }
    }

    function assertNotDefined(actual: any, msg: string) {
        try {
        expect(actual).not.toBeDefined();
        } catch (e) {
            console.error("actual: " + actual +" should not be defined. msg: "+ msg);
        }
    }

describe("Memory", () => {
    let memory: Memory;

    beforeEach(() => {
        memory = new Memory(32);
    });

    /*
    test("write and read string and f64", () => {
        memory.write(new Data("Hello World"));
        memory.write(new Data(987654));
        memory.write(new Data(-5));

        expect(memory.read(0).isStr()).toBe(true);
        expect(memory.read(0).isNumber()).toBe(false);
        expect(memory.read(0).isFloat()).toBe(false);
        expect(memory.read(0).isInt()).toBe(false);
        expect(memory.read(0).getValue()).toBe("Hello World");
        expect(memory.read(0).getType()).toBe(DataType.str);
        expect(memory.read(0).getSize()).toBe(1);
        expect(memory.read(0).getLength()).toBe(11);

        console.log(memory.read(1));
        console.log(memory.read(1).dumpString());

        for (let adr=1; adr < 11; adr++) {
            assertNotDefined(memory.read(adr), "adr: " + adr +" should NOT be defined");
            expect(memory.read(adr)).not.toBeDefined();
        }

        for (let adr=11; adr < 15; adr++) {
            assertEqual(memory.read(adr), null, "adr: " + adr +" should be null");
            expect(memory.read(adr)).not.toBeDefined();
        }

        expect(memory.read(11)).not.toBeDefined();

        expect(memory.read(12).isStr()).toBe(false);
        expect(memory.read(12).isNumber()).toBe(true);
        expect(memory.read(12).isFloat()).toBe(true);
        expect(memory.read(12).isInt()).toBe(false);
        expect(memory.read(12).getValue()).toBe(987654);
        expect(memory.read(12).getType()).toBe(DataType.f64);
        expect(memory.read(12).getSize()).toBe(8);
        expect(memory.read(12).getLength()).toBe(0);

        expect(memory.read(20).isStr()).toBe(false);
        expect(memory.read(20).isNumber()).toBe(true);
        expect(memory.read(20).isFloat()).toBe(false);
        expect(memory.read(20).isInt()).toBe(true);
        expect(memory.read(20).getValue()).toBe(-5);
        expect(memory.read(20).getType()).toBe(DataType.i8);
        expect(memory.read(20).getSize()).toBe(1);
        expect(memory.read(20).getLength()).toBe(0);
    });
    */

    test("write and read string", () => {
        memory.write(new Data("Hello World"));
        expect(memory.read(0).isStr()).toBe(true);
        expect(memory.read(0).getValue()).toBe("Hello World");
        expect(memory.read(0).getType()).toBe(DataType.str);
        expect(memory.read(0).getSize()).toBe(1);
        expect(memory.read(0).getLength()).toBe(11);
    });

    test("write and read i8", () => {
        memory.write(new Data(42), 0);
        memory.write(new Data(142)); // must be i16
        memory.write(new Data(19));
        memory.write(new Data(-122));

        expect(memory.read(0).isNumber()).toBe(true);
        expect(memory.read(0).isInt()).toBe(true);
        expect(memory.read(0).getValue()).toBe(42);
        expect(memory.read(0).getType()).toBe(DataType.i8);

        expect(memory.read(1).isNumber()).toBe(true);
        expect(memory.read(1).isInt()).toBe(true);
        expect(memory.read(1).getValue()).toBe(142); // because 142 > 128
        expect(memory.read(1).getType()).toBe(DataType.i16); // too big for i8

        // TODO what should happen at the second half of i16? -- read(2)

        expect(memory.read(3).isNumber()).toBe(true);
        expect(memory.read(3).isInt()).toBe(true);
        expect(memory.read(3).getValue()).toBe(19);
        expect(memory.read(3).getType()).toBe(DataType.i8);

        expect(memory.read(4).isNumber()).toBe(true);
        expect(memory.read(4).isInt()).toBe(true);
        expect(memory.read(4).getValue()).toBe(-122);
        expect(memory.read(4).getType()).toBe(DataType.i8);
    });

    test("write and read i16", () => {
        memory.write(new Data(42, DataType.i16), 0);
        memory.write(new Data(142, DataType.i16), 7);
        memory.write(new Data(19, DataType.i16));

        expect(memory.read(0).isInt()).toBe(true);
        expect(memory.read(0).getValue()).toBe(42);

        // TODO access second half of an i16
        // What should happen?
        // MAYBE should throw a mid-memory block exception
        //expect(memory.read(1).getValue()).toBe(42);

        expect(memory.read(6)).toBe(undefined); // no Data initialized

        // TODO a bit odd to access i16 on odd memory address
        expect(memory.read(7).isInt()).toBe(true);
        expect(memory.read(7).getValue()).toBe(142);

        // TODO what about accessing second half of i16 at address 8?

        expect(memory.read(9).isCoreFunc()).toBe(false);
        expect(memory.read(9).isColonFunc()).toBe(false);
        expect(memory.read(9).isConditionFunc()).toBe(false);
        expect(memory.read(9).isImmediateFunc()).toBe(false);
        expect(memory.read(9).isInt()).toBe(true);
        expect(memory.read(9).getValue()).toBe(19);
    });
});
