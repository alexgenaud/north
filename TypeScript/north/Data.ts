import { DataBlock, DataType } from "./types";
import Machine from "../north/Machine";

export default class Data {
    private start_address: number = 0;
    private type: DataType = DataType.uninit;
    private value: ((m: Machine) => void) | number | number[] | string = 0;

    constructor(
        value:
            | ((m: Machine) => void)
            | boolean
            | number
            | number[]
            | string = 0,
        type = DataType.uninit,
        address = 0
    ) {
        this.start_address = address;
        if (typeof value === "boolean") {
            this.type =
                type !== DataType.integer
                    ? DataType.tiny_int
                    : DataType.integer;
            this.value = value ? 1 : 0;
            return;
        }
        this.type = type;
        this.value = value;
    }

    public isFunc(): boolean {
        return [
            DataType.fn_colon_norm,
            DataType.fn_colon_condition,
            DataType.fn_colon_immediate,
            DataType.fn_core_norm,
            DataType.fn_core_condition,
            DataType.fn_core_immediate,
        ].includes(this.type);
    }

    public isCoreFunc(): boolean {
        return [
            DataType.fn_core_norm,
            DataType.fn_core_condition,
            DataType.fn_core_immediate,
        ].includes(this.type);
    }

    public isColonFunc(): boolean {
        return [
            DataType.fn_colon_norm,
            DataType.fn_colon_condition,
            DataType.fn_colon_immediate,
        ].includes(this.type);
    }

    public isConditionFunc(): boolean {
        return (
            this.type == DataType.fn_colon_condition ||
            this.type == DataType.fn_core_condition
        );
    }

    public isImmediateFunc(): boolean {
        return (
            this.type == DataType.fn_colon_immediate ||
            this.type == DataType.fn_core_immediate
        );
    }

    public isInt(): boolean {
        return [DataType.integer, DataType.tiny_int].includes(this.type);
    }

    public isStr(): boolean {
        return this.type == DataType.string;
    }

    public isPtr(): boolean {
        return this.type == DataType.ptr_address;
    }

    public isFloat(): boolean {
        return this.type == DataType.float;
    }

    public setAddress(address: number): void {
        this.start_address = address;
    }

    public getAddress() {
        return this.start_address;
    }

    public getValue() {
        return this.value;
    }

    public setValue(
        value: ((m: Machine) => void) | number | number[] | string
    ) {
        this.value = value;
    }

    public dumpData(): DataBlock {
        return {
            address: this.start_address,
            type: this.getTypeName(),
            value: this.getValueName(),
            selected: false,
        };
    }

    public getTypeName():
        | "tiny"
        | "int"
        | "float"
        | "ptr"
        | "str"
        | "core"
        | "colon"
        | "uninit" {
        switch (this.type) {
            case DataType.tiny_int:
                return "tiny";
            case DataType.integer:
                return "int";
            case DataType.float:
                return "float";
            case DataType.string:
                return "str";
            case DataType.ptr_address:
                return "ptr";
            default:
                return this.isCoreFunc()
                    ? "core"
                    : this.isColonFunc()
                    ? "colon"
                    : "uninit";
        }
    }

    public getValueName(): number | string {
        if (this.value === null) {
            return 0;
        }
        if (typeof this.value === "function") {
            return "core";
        }
        if (Array.isArray(this.value)) {
            return "colon";
        }
        return this.value;
    }
}
