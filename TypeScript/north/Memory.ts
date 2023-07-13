import { isInt, assert } from "../north/Util";
import { DataBlock, createUninitDataBlock } from "../north/types";
import Data from "../north/Data";

export default class Memory {
    private size: number;
    private memory: Data[];
    private highestAddress: number;

    constructor(size?: number) {
        this.size = size === undefined ? 64 : size;
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

    overwrite(data: Data, address: number): number {
        const oldData: Data = this.memory[address];
        if (oldData == null) {
            throw new Error(
                "Missing data address: " + address + " to overwrite"
            );
        } else if (data == null) {
            throw new Error(
                "Missing new data to overwrite at address: " + address
            );
        } else if (oldData.getTypeName() !== data.getTypeName()) {
            throw new Error(
                "Overwrite old type: " +
                    oldData.getTypeName() +
                    " with new type: " +
                    data.getTypeName() +
                    " at address: " +
                    address
            );
        } else if (oldData.getValue() === data.getValue()) {
            throw new Error(
                "Overwrite old value: " +
                    oldData.getValue() +
                    " with new value: " +
                    data.getValue() +
                    " at address: " +
                    address
            );
        } else if (oldData.getValueName() === data.getValueName()) {
            throw new Error(
                "Overwrite old value: " +
                    oldData.getValueName() +
                    " with new value: " +
                    data.getValueName() +
                    " at address: " +
                    address
            );
        }

        //data.setAddress(address);
        //this.memory[address] = data;
        oldData.setValue(data.getValue());

        return address;
    }

    write(data: Data, address?: number): number {
        if (data == null || data.getValue() == null) {
            throw new Error("Memory data must not be null");
        }
        const value = data.getValue();
        if (
            !(
                (data.isInt() && isInt(value)) ||
                (data.isCoreFunc() && typeof value === "function") ||
                (data.isColonFunc() && Array.isArray(value))
            )
        ) {
            throw new Error(
                "Memory data: " +
                    value +
                    " of type: " +
                    data.getTypeName() +
                    " must be a number or function"
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
            `Memory address must be a valid integer within bounds: ${address}`
        );

        const oldData = this.memory[address];
        if (oldData != null) {
            //throw new Error(
            console.log(
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

    dumpData(): DataBlock[] {
        console.log("Memory.dataDump");
        const len = Math.min(this.size, this.memory.length, 64);
        const memarray: DataBlock[] = new Array(len);
        for (let address = 0; address < len; address++) {
            const data: Data = this.memory[address];
            if (data == null || !(data instanceof Data)) {
                memarray.push(createUninitDataBlock(address));
                continue;
            }
            memarray.push(data.dumpData());
        }
        return memarray;
    }
}
