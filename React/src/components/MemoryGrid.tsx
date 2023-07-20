//import React from "react";
import { DataBlock } from "../../../TypeScript/north/types";
import MemoryBlock from "./MemoryBlock";

interface MemoryArray {
    memory: DataBlock[];
}

function MemoryGrid({ memory }: MemoryArray) {
    return (
        <div className="grid grid-cols-16 gap-1">
            {memory.map((block) => (
                <MemoryBlock key={"addr" + block.address} block={block} />
            ))}
        </div>
    );
}

export default MemoryGrid;
