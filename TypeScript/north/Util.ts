import Buffer from "./Buffer";
import Data from "./Data";
import Machine from "./Machine";
import Stack from "./Stack";
import { DataType } from "./types";

export enum Mode {
  IGNORE = 3, // can be toggled with EXECUTE in same layer
  BLOCK = 4, // if parent is IGNORED then child layers are blocked
  EXECUTE = 5,
}

export const CONDITIONAL_IGNORE_MODES = [Mode.IGNORE, Mode.BLOCK];

export function isInt(token: any): boolean {
  if (typeof token === "number") {
    return true;
  }
  if (typeof token !== "string") {
    return false;
  }
  if (
    token.match(/^\d+$/g) ||
    (token.startsWith("-") && token.slice(1).match(/^\d+$/g))
  ) {
    return true;
  }
  return false;
}

export function assert(expect: boolean, message: string): void {
  if (!expect) {
    throw new Error("Assertion failed: " + message);
  }
}

export function assertInt(wordName: string, value: any) {
  if (!isInt(value)) {
    throw new Error(
      `${wordName} expects integer but type ${typeof value} with value ${value}`,
    );
  }
}

export function assertIntRangeInclusive(
  wordName: string,
  value: any,
  lowest: number,
  highest: number,
) {
  if (!isInt(value)) {
    throw new Error(
      `${wordName} expects integer but type ${typeof value} with value ${value}`,
    );
  }
  if (value < lowest) {
    throw new Error(
      `${wordName} expects integer >= ${lowest} but value ${value}`,
    );
  }
  if (value > highest) {
    throw new Error(
      `${wordName} expects integer <= ${highest} but value ${value}`,
    );
  }
}

export function assertIntNonZero(wordName: string, value: any) {
  if (!isInt(value)) {
    throw new Error(
      `${wordName} expects integer but type ${typeof value} with value ${value}`,
    );
  }
  if (value === 0) {
    throw new Error(`${wordName} expects non-zero integer but value ${value}`);
  }
}

export function assertIntNonNegative(wordName: string, value: any) {
  if (!isInt(value)) {
    throw new Error(
      `${wordName} expects integer but type ${typeof value} with value ${value}`,
    );
  }
  if (value < 0) {
    throw new Error(`${wordName} expects non-zero integer but value ${value}`);
  }
}

export function assertData(wordName: string, data: Data | null) {
  if (data == null) {
    throw new Error(`${wordName} expects non-null Data`);
  }
  if (!(data instanceof Data)) {
    throw new Error(`${wordName} expects Data but was ${typeof data}`);
  }
  if (data.getType() === DataType.nil) {
    throw new Error(`${wordName} expects non-nil Data`);
  }
  if (data.getValue() == null) {
    throw new Error(`${wordName} expects non-null Data.value`);
  }
}

export function assertDataNumber(wordName: string, data: Data) {
  assertData(wordName, data);
  if (typeof data.getValue() !== "number" || !data.isNumber()) {
    throw new Error(`${wordName} expects Data of number type`);
  }
}

export function assertDataInt(wordName: string, data: Data) {
  assertData(wordName, data);
  if (typeof data.getValue() !== "number" || !data.isInt()) {
    throw new Error(`${wordName} expects Data of integer type`);
  }
}

export function assertNonNull(wordName: string, value: any) {
  if (value == null) {
    throw new Error(`${wordName} expects non-null value`);
  }
}

export function assertFuncIn(m: Machine, wordName: string, expectIn: number) {
  if (m.inputBuffer.length < expectIn) {
    throw new Error(
      `${wordName} expects inputBuffer >= ${expectIn} but only ${m.inputBuffer.length}`,
    );
  }
}

export function assertPeek(
  s: Stack | Buffer,
  wordName: string,
  expectCnt: number,
) {
  if (s.length < expectCnt) {
    throw new Error(
      `${wordName} expects stack >= ${expectCnt} but only ${s.length}`,
    );
  }
}

export function assertFuncOp(m: Machine, wordName: string, expectOp: number) {
  if (m.opstack.length < expectOp) {
    throw new Error(
      `${wordName} expects opstack >= ${expectOp} but only ${m.opstack.length}`,
    );
  }
}

export function assertFuncOpIn(
  m: Machine,
  wordName: string,
  expectOp: number,
  expectIn: number,
) {
  if (m.opstack.length >= expectOp && m.inputBuffer.length >= expectIn) return;
  if (m.opstack.length < expectOp && m.inputBuffer.length < expectIn) {
    throw new Error(
      `${wordName} expects opstack, inputBuffer >= ${expectOp}, ${expectIn} but only ${m.opstack.length}, ${m.inputBuffer.length}`,
    );
  }
  if (m.opstack.length < expectOp) {
    throw new Error(
      `${wordName} expects opstack >= ${expectOp} but only ${m.opstack.length}`,
    );
  }
  if (m.inputBuffer.length < expectIn) {
    throw new Error(
      `${wordName} expects inputBuffer >= ${expectIn} but only ${m.inputBuffer.length}`,
    );
  }
}

export function splitToI8Bytes(address: number): { low: number; high: number } {
  const low = address & 0xff; // Extract the lower 8 bits
  const high = (address >> 8) & 0xff; // Shift right to get the higher 8 bits and then extract them
  return { low, high };
}
