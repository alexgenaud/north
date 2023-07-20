import Data from "../north/Data";
import Dictionary from "../north/Dictionary";
import Machine from "../north/Machine";
import { DataType } from "../north/types";

describe("Dictionary", () => {
    let dictionary: Dictionary;
    let machine: Machine;

    beforeEach(() => {
        machine = new Machine();
        dictionary = machine.dictionary;
    });

    test("add a word and retrieve its data", () => {
        let word = "test";
        const data: Data = new Data([1, 2, 3], DataType.c_n, word);
        dictionary.addWordData(word, data);
        expect(dictionary.getAction(word)).toBe(data);

        word = "test2";
        dictionary.addColonArray(word, [5, 6, 7]);
        const dataBack: Data | null = dictionary.getAction(word);
        expect(dataBack).not.toBeNull();
        expect(dataBack!.isColonFunc()).toBe(true);
        expect(dataBack!.getValue()).toStrictEqual([5, 6, 7]);
    });

    test("return null for non-existing word", () => {
        expect(dictionary.getAction("nonexisting")).toBeNull();
    });
});
