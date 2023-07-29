import Machine from "../north/Machine";
import { INTERPRET } from "./parse/INTERPRET";
import { COMPILE } from "./parse/COMPILE";
import { BasicArgOne } from "./core/BasicArgOne";
import { BasicArgTwo } from "./core/BasicArgTwo";

export default class Interpreter {
  machine: Machine;

  constructor() {
    this.machine = new Machine();
    expect(
      this.machine.load([INTERPRET, COMPILE, BasicArgOne, BasicArgTwo]),
    ).toBe(true);
  }

  execute(string_input: string): void {
    if (!string_input || !string_input.trim()) {
      return;
    }
    this.machine.executeInputBuffer(string_input);
  }
}
