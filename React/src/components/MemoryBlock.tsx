import { DataBlock } from "../../../TypeScript/north/types";

interface Prop {
    block: DataBlock;
}

function MemoryBlock(block: Prop) {
    const { address, type, value, selected } = block.block;

    const borderClass = selected ? "selected border border-dark" : "";
    const key = "memAddress" + address;

    let val: number =
        value == null ? 0 : typeof value == "number" ? value : 128;

    return (
        <div
            key={key}
            style={byteToBgColor(val)}
            className={`memory-block ${borderClass}`}
        >
            {value}
        </div>
    );
}

export default MemoryBlock;

function byteToBgColor(i8Byte: number) {
    let res = "hsl(" + (14 * (i8Byte % 256)) / 10 + ", 100%, 60%)";
    if (i8Byte == 0) res = "hsl(0, 50%, 80%)";
    return { backgroundColor: res };
}
