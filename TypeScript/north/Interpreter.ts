import Machine from '../north/Machine';


export default class Interpreter {
    machine: Machine;

    constructor() {
        this.machine = new Machine();
    }

    execute(string_input: string): void {
        if (!string_input || !string_input.trim()) {
            return;
        }
        const tokens = string_input.trim().split(/\s+/);
        for (const token of tokens) {
            this.machine.execute(token);
        }
    }
}
