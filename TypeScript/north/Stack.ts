import { isInt, assert, Mode } from "../north/Util";

export default class Stack {
  private stack: (number | string)[];

  constructor(initstack?: string | string[] | undefined) {
    if (Array.isArray(initstack)) {
      this.stack = initstack;
    } else if (typeof initstack === "string") {
      this.stack = initstack.split(" ");
    } else {
      this.stack = [];
    }
  }

  push(value: number | string | Mode): void {
    assert(
      typeof value === "number" || typeof value === "string",
      "Stack token must be a string or number",
    );
    if (isInt(value)) {
      this.stack.push(Number(value));
      //this.stack.push(parseInt(value, 10));
    } else {
      this.stack.push(value + "");
    }
  }

  extend(list_value: any[]): void {
    assert(Array.isArray(list_value), "Extend stack with an array only");
    this.stack.push(...list_value);
  }

  pop(index = -1): any {
    assert(this.stack.length > 0, "Stack must have tokens to pop");
    if (
      index === undefined ||
      index === -1 ||
      index === this.stack.length - 1
    ) {
      return this.stack.pop();
    } else if (index < 0) {
      return this.stack.splice(this.stack.length + index, 1)[0];
    }
    return this.stack.splice(index, 1)[0];
  }

  toggle(next: Mode): void {
    assert(Object.values(Mode).includes(next), "Must set transition mode");
    this.stack[this.stack.length - 1] = next;
  }

  public peek(index = -1): any {
    if (this.stack.length < 1) {
      console.log("Stack peek empty");
      return undefined;
    }
    if (index < 0) {
      index = this.stack.length + index;
    }
    return this.stack[index];
  }

  is_empty(): boolean {
    return this.stack.length === 0;
  }

  get length(): number {
    return this.stack.length;
  }

  toString(): string {
    return this.stack.join(" ");
  }
}
