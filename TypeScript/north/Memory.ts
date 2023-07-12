import { isInt, assert } from '../north/Util';
import Data from '../north/Data';


export default class Memory {
    private size: number;
    private memory: Data[];
    private highestAddress: number;

    constructor(size?: number) {
        this.size = size === undefined ? 64 : size;
        this.memory = new Array(this.size).fill(0);
        this.highestAddress = -1;
    }

    read(address: number): Data {
        assert(
            Number.isInteger(address) && address >= 0 && address < this.memory.length,
            `Memory address must be a valid integer within bounds: ${address}`
        );
        return this.memory[address];
    }

    write(data: Data, address?: number): number {
        if (data == null || data.value == null) {
            throw new Error("Memory data must not be null");
        }
        if ( ! ((data.is_integer && isInt(data.value)) ||
                (data.is_fn_core && typeof data.value === 'function')  ||
                (data.is_fn_colon_array && Array.isArray(data.value)))) {
            throw new Error('Memory data: '+ data.value +' must be a number or function');
        }
        if (address === undefined) {
            address = this.highestAddress = this.highestAddress + 1;
            //console.log("address not specified so: "+ address);
        } else if (address > this.highestAddress) {
            this.highestAddress = address;
        }
        assert(
            Number.isInteger(address) && address >= 0 && address < this.memory.length,
            `Memory address must be a valid integer within bounds: ${address}`
        );

        this.memory[address] = data;
        //if (address > 64) console.log("set: "+ data +" : at address: "+ address);
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
