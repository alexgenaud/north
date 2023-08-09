import Machine from "../north/Machine";
import Data from "../north/Data";
import { DataType, getTypeStr, Func } from "./types";

export default class Dictionary {
  private core: { [word: string]: number[] };
  private machine: Machine;

  constructor(machine: Machine) {
    this.core = {};
    this.machine = machine;
  }

  public addCoreCondition(word: string, action: Func): number {
    return this.addWordData(word, new Data(action, DataType.f_c, word));
  }

  public addCoreImmediate(word: string, action: Func): number {
    return this.addWordData(word, new Data(action, DataType.f_i, word));
  }

  public addCoreFunc(word: string, action: Func): number {
    return this.addWordData(word, new Data(action, DataType.f_n, word));
  }

  public addI8(word: string, action: number): number {
    return this.addWordData(word, new Data(action, DataType.i8));
  }

  public addI16(word: string, action: number): number {
    return this.addWordData(word, new Data(action, DataType.i16));
  }

  public addNumber(word: string, action: number): number {
    return this.addWordData(word, new Data(action)); // type to be determined
  }

  public addPointer(word: string, value: number, refType: DataType): number {
    const addressOfValue = this.machine.write(new Data(value, refType));
    const ptrType = "* " + getTypeStr(refType);
    return this.addWordData(
      word,
      new Data(addressOfValue, DataType.i16, ptrType),
    );
  }

  public addWordData(word: string, data: Data): number {
    if (!this.core[word]) {
      this.core[word] = [];
    }
    const address = this.machine.write(data);
    this.core[word].push(address);
    return address;
  }

  public addColonArray(word: string, addressArray: number[]): number {
    const dataHeader: Data = new Data(
      0,
      DataType.c_n,
      word,
      0,
      addressArray.length,
    );
    const addressHeader = this.addWordData(word, dataHeader);
    let addressLocation = addressHeader + 2;
    dataHeader.setValue(addressLocation);

    // TODO we do not need to pass the addressArray as there is one global m.compile_rel_adrs
    for (let index = 0; index < addressArray.length; index++) {
      const i16address = addressArray[index];
      this.machine.write(new Data(i16address, DataType.i16), addressLocation);
      addressLocation += 2;
    }
    return addressHeader;
  }

  /** looks word up in dictionary. Return null if not found.
   *  If dictionary word found, expect a list of memory addresses in dictionary.
   *  return the value at the latest memory address.
   */
  public getAction(word: string): Data | null {
    if (!(typeof word === "string" && word.length > 0)) {
      throw new Error("Dictionary word must be a non-empty string");
    }
    const actionList = this.core[word];
    const address = actionList ? actionList[actionList.length - 1] : null;
    const result = address != null ? this.machine.read(address) : null;
    return result;
  }

  public getWordAddress(word: string): number | null {
    if (!(typeof word === "string" && word.length > 0)) {
      throw new Error("Dictionary word must be a non-empty string");
    }
    const actionList = this.core[word];
    return actionList ? actionList[actionList.length - 1] : null;
  }

  toString(): string {
    const indent = "";
    let result = "";
    for (const [key, value] of Object.entries(this.core)) {
      result += `${indent}${key}: `;
      if (Array.isArray(value)) {
        const formattedItems = value.map((item) =>
          typeof item === "function" ? "func" : String(item),
        );
        result += `[ ${formattedItems.join(", ")} ]`;
      } else if (typeof value === "object") {
        result += "dict\n";
      } else if (typeof value === "function") {
        result += "func\n";
      } else {
        result += String(value);
      }
      result += "\n";
    }
    return result;
  }
}
