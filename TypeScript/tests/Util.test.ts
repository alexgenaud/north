import { isInt, assert } from "../north/Util";

describe("Util", () => {
  test("should return true for integer values", () => {
    expect(isInt(42)).toBe(true);
    expect(isInt(0)).toBe(true);
    expect(isInt(-13)).toBe(true);
    expect(isInt("42")).toBe(true);
    expect(isInt("-42")).toBe(true);
  });

  test("should return false for non-integer values", () => {
    expect(isInt("42.5")).toBe(false);
    expect(isInt("-")).toBe(false);
    expect(isInt("0-")).toBe(false);
    expect(isInt("")).toBe(false);
    expect(isInt("abc")).toBe(false);
    expect(isInt({})).toBe(false);
    expect(isInt("bogus")).toBe(false);
    expect(isInt(null)).toBe(false);
    expect(isInt(undefined)).toBe(false);
    expect(isInt(true)).toBe(false);
    expect(isInt(false)).toBe(false);
  });

  test("should not throw an error when expect is true", () => {
    expect(() => assert(true, "Test assertion")).not.toThrow();
  });

  test("should throw an error when expect is false", () => {
    expect(() => {
      assert(false, "Test assertion");
    }).toThrowError("Assertion failed");
  });
});
