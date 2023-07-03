import { isInt, assert } from '../north/Util';
import { Action } from '../north/Dictionary';


export default class Memory {
    size: number;
    memory: Action[];
    highestAddress: number;

    constructor(size?: number) {
        this.size = size === undefined ? 55 : size;
        this.memory = new Array(this.size).fill(0);
        this.highestAddress = -1;
    }

    read(address: number): Action {
        assert(
            Number.isInteger(address) && address >= 0 && address < this.memory.length,
            `Memory address must be a valid integer within bounds: ${address}`
        );
        return this.memory[address];
    }

    write(action: Action, address?: number): number {
        if (!(typeof action === 'number' || Array.isArray(action) ||
                     typeof action === 'function')) {
            throw new Error('Memory action must be a number, an array, or a function');
        }
        if (address === undefined) {
            address = this.highestAddress = this.highestAddress + 1;
        } else if (address > this.highestAddress) {
            this.highestAddress = address;
        }
        assert(
            Number.isInteger(address) && address >= 0 && address < this.memory.length,
            `Memory address must be a valid integer within bounds: ${address}`
        );
        this.memory[address] = action;
        return address;
    }

    toString(): string {
        let memoryStr = "";
        for (let address = 0; address < this.memory.length; address++) {
            const value = this.memory[address];
            if (typeof value === "string") {
                memoryStr += `${address}: ${value}\n`;
            } else if (Number.isInteger(value)) {
                memoryStr += `${address}: ${value}\n`;
            } else if (typeof value === "function") {
                memoryStr += `${address}: call\n`;
            } else {
                memoryStr += `${address}: ${typeof value}\n`;
            }
        }
        return memoryStr;
    }
}
