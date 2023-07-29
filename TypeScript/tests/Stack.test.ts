import Stack from "../north/Stack";

describe("Stack", () => {
  let stack: Stack;

  beforeEach(() => {
    stack = new Stack();
  });

  test("push and pop values", () => {
    stack.push(42);
    expect(stack.pop()).toBe(42);
  });

  test("throw exception for empty stack", () => {
    expect(stack.is_empty()).toBe(true);
    expect(() => {
      stack.pop();
    }).toThrow("must have tokens to pop");
  });

  test("return peeked value without popping", () => {
    stack.push("Hello");
    stack.push("World");
    expect(stack.peek()).toBe("World");
    expect(stack.pop()).toBe("World");
    expect(stack.pop()).toBe("Hello");
  });

  test("return stack length", () => {
    stack.push(1);
    stack.push(2);
    expect(stack.length).toBe(2);
  });

  test("return stack contents as string", () => {
    stack.push(1);
    stack.push(2);
    expect(stack.toString()).toBe("1 2");
  });
});
