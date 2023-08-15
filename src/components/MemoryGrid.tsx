import MemoryBlock from "./MemoryBlock";
import machine from "../model/MachineSingleton";
import { useEffect, useState } from "react";
import { DataBlock } from "../../TypeScript/north/types";

function MemoryGrid() {
  let firstRender = true;
  const [memory, setMemory] = useState<DataBlock[]>([]);

  const updateMemory = () => {
    const newMemory: DataBlock[] = machine.dumpMemory();
    setMemory([...newMemory]);
  };

  useEffect(() => {
    if (firstRender) {
      updateMemory(); // Initial update
      firstRender = false;
      machine.onMemoryChange(updateMemory);
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
