import { isInt, assert } from "../north/Util";
import { DataBlock, createUninitDataBlock } from "../north/types";
import Data from "../north/Data";

export default class Memory {
    private size: number;
    private memory: Data[];
    private highestAddress: number;

    constructor(size?: number) {
        this.size = size === undefined ? 128 : size;
        this.memory = new Array(this.size);
        this.highestAddress = -1;
    }

    read(address: number): Data {
        assert(
            Number.isInteger(address) &&
                address >= 0 &&
                address < this.memory.length,
            `Memory address must be a valid integer within bounds: ${address}`
        );
        return this.memory[address];
    }

    overwrite(newValue: number, address: number): number {
        const oldData: Data = this.memory[address];
        if (oldData == null) {
            throw new Error(
                "Missing data address: " + address + " to overwrite"
            );
        } else if (oldData.getValue() === newValue) {
            console.log("Overwritting old var with same value: " + newValue);
        }
        oldData.setValue(newValue);
        return address; // same old address
    }

    write(data: Data, address?: number): number {
        if (data == null || data.getValue() == null) {
            throw new Error("Memory data must not be null");
        }
        const value = data.getValue();
        if (
            !(
                (data.isInt() && isInt(value)) ||
                (data.isStr() && typeof value === "string") ||
                (data.isFloat() && typeof value === "number") ||
                (data.isCoreFunc() && typeof value === "function") ||
                (data.isColonFunc() && Array.isArray(value))
            )
        ) {
            throw new Error(
                "Memory data: " +
                    data.dump() +
                    " type: " +
                    data.getType() +
                    " native typeof value === " +
                    typeof data.getValue() +
                    " must be valid"
            );
        }
        if (address === undefined) {
            address = this.highestAddress = this.highestAddress + 1;
        } else if (address > this.highestAddress) {
            this.highestAddress = address;
        }
        assert(
            Number.isInteger(address) &&
                address >= 0 &&
                address < this.memory.length,
            `Memory address: ${address} must be a valid integer within bounds: ${this.size}`
        );

        const oldData = this.memory[address];
        if (oldData != null) {
            console.error(
                "Overwriting old data at address: " +
                    address +
                    " old: " +
                    oldData +
                    " new: " +
                    data,
                oldData,
                data
            );
        }

        data.setAddress(address);
        this.memory[address] = data;
        const bytesize = data.getSize() - 1;
        if (bytesize < 0) {
            throw new Error("Data cannot be less than one byte");
        }
        this.highestAddress = data.getSize() + this.highestAddress - 1;
        if (this.highestAddress > this.size) {
            throw new Error(
                "Out of Memory. Required: " +
                    this.highestAddress +
                    " but only have: " +
                    this.size +
                    " bytes of memory"
            );
        }
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

    dump(): DataBlock[] {
        const len = Math.min(this.size, this.memory.length, 512);
        const memarray: DataBlock[] = new Array();
        let last_nil_adr = len;
        let nil_sequence = 0;
        for (let adr = 0; adr < len && adr < last_nil_adr; adr++) {
            const data: Data = this.memory[adr];
            if (data == null || !(data instanceof Data)) {
                nil_sequence++;
                if (nil_sequence > 7 && last_nil_adr === len) {
                    last_nil_adr = 16 * Math.floor((adr + 16) / 16);
                }
                memarray.push(createUninitDataBlock(adr));
                continue;
            }
            nil_sequence = 0;
            last_nil_adr = len;
            const bytesize = data.getSize();
            if (bytesize < 1 || bytesize > 8) {
                console.warn(
                    "Unusual data byte size: " +
                        bytesize +
                        " at address: " +
                        adr +
                        " size: " +
                        data.getSize()
                );
            }

            if (bytesize > 1) {
                adr += bytesize - 1;
            }
            memarray.push(data.dump());
        }
        return memarray;
    }
}
