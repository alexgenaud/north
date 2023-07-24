import MemoryBlock from "./MemoryBlock";
import machine from "../model/MachineSingleton";
import { useEffect, useState } from "react";
import { DataBlock } from "../../../TypeScript/north/types";

function MemoryGrid() {
    console.log("MemoryGrid constructor");
    let firstRender = true;
    const [memory, setMemory] = useState<DataBlock[]>([]);

    const updateMemory = () => {
        const newMemory: DataBlock[] = machine.dumpMemory();
        console.log("MemoryGrid.updateMemory Update all memory", newMemory);
        setMemory([...newMemory]);
    };

    useEffect(() => {
        if (firstRender) {
            console.log("MemoryGrid.useEffect first render");
            updateMemory(); // Initial update
            firstRender = false;
            machine.onMemoryChange(updateMemory);
        } else {
            console.log("MemoryGrid.useEffect: subsequent render");
        }
    }, []); // [memory]);

    return (
        <div className="grid grid-cols-16 gap-1">
            {memory.map((block) => (
                <MemoryBlock key={block.address} block={block} />
            ))}
        </div>
    );
}

export default MemoryGrid;
