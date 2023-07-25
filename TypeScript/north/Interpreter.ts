import Machine from "../north/Machine";
import { INTERPRET } from "../north/parse/INTERPRET";
import { wordsMany } from "./WordsMany";

export default class Interpreter {
    machine: Machine;

    constructor() {
        this.machine = new Machine();
        expect(this.machine.load([INTERPRET, wordsMany])).toBe(true);
    }

    execute(string_input: string): void {
        if (!string_input || !string_input.trim()) {
            return;
        }
        this.machine.executeInputBuffer(string_input);
    }
}
