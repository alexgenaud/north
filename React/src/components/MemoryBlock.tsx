import React from "react";
import { DataBlock } from "../../../TypeScript/north/types";

interface Prop {
    block: DataBlock;
}

function MemoryBlock(block: Prop) {
    const { address, type, value, size } = block.block;
    const borderClass = ""; // selected ? "selected border border-dark" : "";
    const colspanClass = size < 2 ? "" : "col-span-" + size + " ";

    const valNum: number = isNaN(Number(value)) ? 0 : Number(value);
    const valStr = strToHex(value);

    const adrHex = strToHex(address + "");
    return (
        <div
            key={address}
            className={`${colspanClass} xcol-span-${size} memory-block ${borderClass}`}
        >
            <div style={byteToBgColor(address + 2560)}>
                {adrHex} ({address})
                <br />
                {type}
            </div>
            <div style={byteToBgColor(valNum)}>{valStr}</div>
        </div>
    );
}

export default MemoryBlock;

function strToHex(str: string): string {
    const valNum: number = isNaN(Number(str)) ? 0 : Number(str);
    return valNum === 0
        ? str
        : valNum.toString(16).toUpperCase().padStart(2, "0"); // HEX
}

function byteToBgColor(i8Byte: number) {
    if (i8Byte == 0) return { backgroundColor: "hsl(0, 50%, 80%)" };
    const i8to360 = Math.floor((2 * 1.406 * (i8Byte % 256)) % 360);
    const res = "hsl(" + i8to360 + ", 100%, 70%)";
    return { backgroundColor: res };
}
