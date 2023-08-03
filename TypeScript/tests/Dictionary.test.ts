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

  test("add colon array and retrieve its header", () => {
    const word = "test2";
    dictionary.addColonArray(word, [5, 6, 7]);
    const dataBack = dictionary.getAction(word) as Data;
    expect(dataBack).not.toBeNull();
    expect(dataBack.isColonFunc()).toBe(true);
    expect(dataBack.getValue()).toBeGreaterThan(0);
    expect(dataBack.getSize()).toStrictEqual(2);
    expect(dataBack.getLength()).toStrictEqual(3);
  });

  test("return null for non-existing word", () => {
    expect(dictionary.getAction("nonexisting")).toBeNull();
  });
});
