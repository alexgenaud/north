import Machine from "../../TypeScript/north/Machine";
import { BasicArgOne } from "../../TypeScript/north/core/BasicArgOne";
import { BasicArgTwo } from "../../TypeScript/north/core/BasicArgTwo";
import { COMPILE } from "../../TypeScript/north/parse/COMPILE";
import { CONST } from "../../TypeScript/north/parse/CONST";
import { Condition } from "../../TypeScript/north/core/Condition";
import { DataBlock, createUninitDataBlock } from "../../TypeScript/north/types";
import { INTERPRET } from "../../TypeScript/north/parse/INTERPRET";
import { Jump } from "../../TypeScript/north/core/Jump";
import { Loop } from "../../TypeScript/north/core/Loop";
import { VAR } from "../../TypeScript/north/parse/VAR";

class Singleton {
  private static instance: Singleton;
  public static getInstance(): Singleton {
    if (Singleton.instance == null) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }

  private memory: DataBlock[] = [];
  private memoryChange = false;
  private memoryChangeListeners: (() => void)[] = [];

  private opStack = "";
  private opStackChange = false;
  private opStackChangeListeners: (() => void)[] = [];

  private coStack = "";
  private coStackChange = false;
  private coStackChangeListeners: (() => void)[] = [];

  private forth = new Machine();

  private constructor() {
    this.forth.load([
      INTERPRET,
      COMPILE,
      CONST,
      VAR,
      Jump,
      Loop,
      Condition,
      BasicArgOne,
      BasicArgTwo,
    ]);
    this.updateMemory();
  }

  //
  // actions that likley alter machine, memory, stacks
  //
  public executeInputBuffer(input: string) {
    this.forth.executeInputBuffer(input);
    this.updateMemory();
    this.updateStacks();
    this.notify();
  }

  //
  // dump latest data (whether changed or not)
  //
  public dumpMemory(): DataBlock[] {
    return this.memory;
  }

  public dumpCoStack(): string {
    return this.coStack;
  }

  public dumpOpStack(): string {
    return this.opStack;
  }

  private updateStacks() {
    const newOpStack = this.forth.opStackString();
    if (this.opStack !== newOpStack) {
      this.opStack = newOpStack;
      this.opStackChange = true;
    }

    const newCoStack = this.forth.coStackString();
    if (this.coStack !== newCoStack) {
      this.coStack = newCoStack;
      this.coStackChange = true;
    }
  }

  //
  // get latest data, determine if any changes, set change = true | false
  //
  private updateMemory() {
    const newMemory: DataBlock[] = this.forth.dump();

    let len = newMemory.length;

    // fix data that fall off the 16 col wide row edge
    for (let d = 0; d < len; d++) {
      // We must break up some multi-byte to prevent "falling off the edge".
      // We break large data from the right side of the grid
      // and continue on the next line on the left.
      const data: DataBlock = newMemory[d];
      const size: number = data.size;
      if (size < 2) continue; // one byte is never a problem
      const adr: number = data.address;
      const adr_end = adr + size - 1;
      const last_adr_in_row = 16 * Math.floor((adr + 16) / 16) - 1;
      if (adr_end <= last_adr_in_row) continue; // fits on the line
      const contData = createUninitDataBlock(last_adr_in_row + 1); // next line
      contData.size = adr_end - last_adr_in_row;
      contData.length = 0;
      contData.type = data.type;
      if (typeof data.value === "number" || typeof data.value === "string") {
        contData.value = data.value;
      } else {
        contData.value = "continued";
      }
      newMemory.splice(++d, 0, contData); // insert after current element
      len++;
      data.size = data.size - contData.size;
    }

    // TODO consider line changes only
    if (this.memory.length > len) len = this.memory.length;

    for (let d = 0; d < len; d++) {
      const od = this.memory[d];
      const nd = newMemory[d];
      if (od == null) {
        this.memoryChange = true;
        this.memory.push(...newMemory.slice(d));
        break;
      }
      if (nd == null) {
        this.memoryChange = true;
        this.memory.splice(d);
        break;
      }
      if (
        nd.address !== od.address ||
        nd.size !== od.size ||
        nd.length !== od.length ||
        nd.type !== od.type ||
        nd.value !== od.value
      ) {
        this.memoryChange = true;
        this.memory[d] = nd;
        continue;
      }
    }
  }

  //
  // handle subscription and notifications of changes
  //
  private notify() {
    if (this.opStackChange) this.notifyOpStackChange();
    this.opStackChange = false;
    if (this.coStackChange) this.notifyCoStackChange();
    this.coStackChange = false;
    if (this.memoryChange) this.notifyMemoryChange();
    this.memoryChange = false;
  }

  public onMemoryChange(callback: () => void) {
    this.memoryChangeListeners.push(callback);
  }
  private notifyMemoryChange() {
    this.memoryChangeListeners.forEach((listener) => listener());
  }

  public onOpStackChange(callback: () => void) {
    this.opStackChangeListeners.push(callback);
  }
  private notifyOpStackChange() {
    this.opStackChangeListeners.forEach((listener) => listener());
  }

  public onCoStackChange(callback: () => void) {
    this.coStackChangeListeners.push(callback);
  }
  private notifyCoStackChange() {
    this.coStackChangeListeners.forEach((listener) => listener());
  }
}

const machine = Singleton.getInstance();
export default machine;
