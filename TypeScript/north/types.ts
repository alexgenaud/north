// types.ts
import Machine from "../north/Machine";

export type DataTypeStr =
  | "f_n"
  | "f_i"
  | "f_c"
  | "c_n"
  | "c_i"
  | "c_c"
  | "str"
  | "f64"
  | "i8"
  | "i16"
  | "nil";
export enum DataType {
  f_n = 128,
  f_i = 129,
  f_c = 130,
  c_n = 131,
  c_i = 132,
  c_c = 133,
  str = 134,
  f64 = 135,
  i8 = 136,
  i16 = 137,
  nil = 0,
}

export interface DataBlock {
  address: number;
  type: DataTypeStr;
  value: string;
  size: number;
  length: number;
}

export type Loadable = {
  (ma: Machine): boolean;
};

export type Func = {
  (m: Machine): void;
};

export function createUninitDataBlock(address: number): DataBlock {
  return {
    address: address,
    type: "nil",
    value: "0",
    size: 1,
    length: 0,
  };
}

export function getTypeStr(type: DataType): DataTypeStr {
  switch (type) {
    case DataType.f_n:
      return "f_n";
    case DataType.f_i:
      return "f_i";
    case DataType.f_c:
      return "f_c";
    case DataType.c_n:
      return "c_n";
    case DataType.c_i:
      return "c_i";
    case DataType.c_c:
      return "c_c";
    case DataType.str:
      return "str";
    case DataType.f64:
      return "f64";
    case DataType.i8:
      return "i8";
    case DataType.i16:
      return "i16";
    default:
      return "nil";
  }
}

export function isI16(num: number): boolean {
  return Number.isInteger(num) && num >= 0 && num <= 65535;
}

export function isI16Array(arr: number[]): arr is number[] {
  return arr.every(isI16);
}
