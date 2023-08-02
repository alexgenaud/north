import Buffer from "../north/Buffer";
import Data from "../north/Data";
import Dictionary from "../north/Dictionary";
import Memory from "../north/Memory";
import Stack from "../north/Stack";
import { DataBlock, Loadable, Func } from "./types";
import { assertNonNull, Mode } from "./Util";

export default class Machine {
  dictionary: Dictionary;
  private memory: Memory;
  opstack: Stack;
  costack: Stack;
  inputBuffer: Buffer;
  compile_definition: (number | string)[] | null;

  constructor() {
    this.memory = new Memory(128);
    this.dictionary = new Dictionary(this);
    this.opstack = new Stack();
    this.costack = new Stack();
    this.inputBuffer = new Buffer();
    this.costack.push(Mode.EXECUTE);
    this.compile_definition = null;
  }

  load(wordLoaders: Loadable[]) {
    let allSuccess: boolean = wordLoaders && wordLoaders.length > 0;
    wordLoaders.forEach((loader: Loadable) => {
      const success = loader(this);
      if (!success) allSuccess = false;
    });
    return allSuccess;
  }

  executeInputBuffer(input: string) {
    assertNonNull("Machine.executeInputBuffer", input);
    const tokens = input.trim().split(/\s+/);
    this.inputBuffer.push(tokens);
    if (this.inputBuffer.isEmpty()) return;
    this.quitLoop();
  }

  quitLoop() {
    const parsePtr = this.dictionary.getWordAddress("PARSE") as number;
    while (!this.inputBuffer.isEmpty()) {
      const adrOfParser = this.read(parsePtr).getValue() as number;
      const parser = this.read(adrOfParser).getValue() as Func;
      parser(this);
    }
  }

  write(data: Data, address?: number): number {
    return this.memory.write(data, address);
  }

  overwrite(newValue: number, address: number): number {
    return this.memory.overwrite(newValue, address);
  }

  read(address: number): Data {
    return this.memory.read(address);
  }

  dump(): DataBlock[] {
    const ret: DataBlock[] = this.memory.dump();
    return ret;
  }

  opStackString(): string {
    return this.opstack.toString();
  }

  coStackString(): string {
    return this.costack.toString();
  }
}
