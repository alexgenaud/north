import { DataBlock, DataType, DataTypeStr, getTypeStr, Func } from "./types";

export default class Data {
  private value: Func | number | string = 0;
  private type: DataType = DataType.nil;
  private meta = "";
  private address = 0;
  private bytesize = 1;
  private length = 0;

  constructor(
    value: // must be set at construction
    Func | boolean | number | string = 0,
    type = DataType.nil, // often suggestion, but _i, _c, i8, i16, f64 should be set
    meta = "", // often only function word name
    address = 0, // often unknown until set
    length = 0,
  ) {
    this.meta = meta == null ? "" : meta;
    this.address = address;
    if (typeof value === "boolean") {
      this.value = value ? 1 : (0 as number);
    } else {
      this.value = value;
    }

    if (typeof value === "number" && value === 0 && DataType.nil == type) {
      console.error("Setting nil Data at adr: " + address + " meta: " + meta);
      return;
    } else if (
      typeof value === "number" &&
      value === 0 &&
      [DataType.c_n, DataType.c_c, DataType.c_i].includes(type)
    ) {
      this.type = type;
      this.bytesize = 2; // i16 address pointer
      this.length = length;
    } else if (typeof value === "function") {
      this.type = [DataType.f_i, DataType.f_c].includes(type)
        ? type
        : DataType.f_n;
    } else if (typeof value === "string") {
      this.type = DataType.str; // could make a case for i8 = 1 byte ASCII char
      this.bytesize = 1;
      this.length = value.length;
    } else if (typeof value === "number") {
      if (value >= -128 && value <= 127) {
        this.type = [DataType.f64, DataType.i16].includes(type)
          ? type
          : DataType.i8;
      } else if (value >= -32768 && value <= 32767) {
        this.type = [DataType.f64].includes(type) ? type : DataType.i16;
      } else {
        this.type = DataType.f64;
      }
      this.bytesize =
        DataType.f64 === this.type
          ? 8
          : DataType.i16 === this.type
          ? 2
          : DataType.i8 === this.type
          ? 1
          : -1;
    } else {
      console.error(
        "Unexpected data constructor type: " +
          getTypeStr(type) +
          " value: " +
          JSON.stringify(value),
        value,
      );
    }
  }

  public isFunc(): boolean {
    return [
      DataType.f_n,
      DataType.f_c,
      DataType.f_i,
      DataType.c_n,
      DataType.c_c,
      DataType.c_i,
    ].includes(this.type);
  }

  public isCoreFunc(): boolean {
    return [DataType.f_n, DataType.f_c, DataType.f_i].includes(this.type);
  }

  public isColonFunc(): boolean {
    return [DataType.c_n, DataType.c_c, DataType.c_i].includes(this.type);
  }

  public isConditionFunc(): boolean {
    return [DataType.f_c, DataType.c_c].includes(this.type);
  }

  public isImmediateFunc(): boolean {
    return [DataType.f_i, DataType.c_i].includes(this.type);
  }

  public isStr(): boolean {
    return DataType.str === this.type;
  }

  public isInt(): boolean {
    return [DataType.i8, DataType.i16].includes(this.type);
  }

  public isFloat(): boolean {
    return DataType.f64 === this.type;
  }

  public isNumber(): boolean {
    return [DataType.i8, DataType.i16, DataType.f64].includes(this.type);
  }

  public setAddress(address: number): void {
    this.address = address;
  }

  public getAddress() {
    return this.address;
  }

  public getValue() {
    return this.value;
  }

  public getType(): DataType {
    return this.type;
  }

  public getTypeString(): DataTypeStr {
    return getTypeStr(this.type);
  }

  /** Byte size of this datum
   *
   * May be 1 for a string or array pointer, even if the array length or string length may be large
   */
  public getSize() {
    return this.bytesize;
  }

  /** Usually 0 unless string or array
   */
  public getLength() {
    return this.length;
  }

  public setValue(value: Func | number | string) {
    if (typeof value !== typeof this.value) {
      console.error(
        "SetValue: " +
          value +
          " (" +
          typeof value +
          ") incompatible with existing native value: " +
          this.value +
          " (" +
          typeof this.value +
          ")",
      );
    }

    if (typeof this.value === "string" && this.isStr()) {
      console.warn(
        "Replacing string by setValue will work in JS but not in fixed memory. Replacing " +
          this.value +
          " with " +
          value,
      );
      // TODO setValue(string) will need to check string length
      // and/or replace the subsequent array values in memory
      this.length = (value as string).length;
    } else if (
      this.isCoreFunc() ||
      typeof this.value === "function" ||
      typeof value == "function"
    ) {
      throw new Error(
        "Cannot setValue new function in fixed memory at address" +
          this.address,
      );
    } else if (this.isColonFunc() && typeof value === "number") {
      // TODO this is called to update the 'next' address
      // Find a cleaner way
    } else if (typeof this.value === "number" && this.isNumber()) {
      if (
        typeof value === "number" &&
        (value < -128 || value > 127) &&
        ![DataType.i16, DataType.f64].includes(this.type)
      ) {
        console.error(
          "setValue value: " +
            value +
            " incompatible with type: " +
            getTypeStr(this.type),
        );
      } else if (
        typeof value === "number" &&
        (value < -32768 || value > 32767) &&
        ![DataType.f64].includes(this.type)
      ) {
        console.error(
          "setValue value: " +
            value +
            " incompatible with type: " +
            getTypeStr(this.type),
        );
      }
    } else if (
      typeof this.value === "number" &&
      this.value === 0 &&
      this.type === DataType.nil
    ) {
      console.warn(
        "Replacing nil with arbitrary value must be possible, requires a think",
      );
    } else {
      console.warn("Unexpected case of setValue at address: " + this.address);
    }
    this.value = value;
  }

  public dump(): DataBlock {
    return {
      address: this.address,
      type: getTypeStr(this.type),
      value: this.valueToString(),
      size: this.bytesize,
      length: this.length,
    };
  }

  public dumpString(): string {
    return (
      "{ address: " +
      this.address +
      ", type: " +
      getTypeStr(this.type) +
      ", value: " +
      this.valueToString() +
      ", size: " +
      this.bytesize +
      ", length: " +
      this.length +
      " }"
    );
  }

  private valueToString(): string {
    if (typeof this.value === "number" && this.isNumber()) {
      return ("" + this.value) as string;
    } else if (this.isColonFunc()) {
      return this.meta + ":" + this.length;
    } else if (typeof this.value === "string" && this.isStr()) {
      if (this.value.length !== this.length) {
        console.error(
          "TEMP expect string length == bytesize (" +
            this.value.length +
            " != " +
            this.bytesize +
            ")",
        );
      }
      return this.value + "";
    } else if (typeof this.value === "function" && this.isCoreFunc()) {
      return this.meta + ""; // should be the word name
    }
    throw new Error("Unexpected value");
  }
}
