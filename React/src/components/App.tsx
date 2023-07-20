import FormInput from "./FormInput";
import MemoryGrid from "./MemoryGrid";
import Machine from "../../../TypeScript/north/Machine";
import { useEffect, useState } from "react";
import {
    DataBlock,
    createUninitDataBlock,
} from "../../../TypeScript/north/types";
import React from "react";

const machine: Machine = new Machine();

function App() {
    const [memory, setMemory] = useState<DataBlock[]>([]);

    useEffect(() => {
        const updateMemory = () => {
            const newMemory: DataBlock[] = machine.dump();
            let len = newMemory.length;

            for (let d = 0; d < len; d++) {
                // We must break up some multi-byte to prevent "falling off the edge".
                // We break large data from the right side of the grid
                // and continue on the next line on the left.
                const data: DataBlock = newMemory[d];
                const size: number = data.size;
                if (size < 2) continue; // one byte is never a problem
                const adr: number = data.address;
                const adr_end = adr + size - 1;
                const last_adr_in_row = 16 * Math.floor((adr + 16) / 16) - 1;
                if (adr_end <= last_adr_in_row) continue; // fits on the line
                let contData = createUninitDataBlock(last_adr_in_row + 1); // next line
                contData.size = adr_end - last_adr_in_row;
                contData.length = 0;
                contData.type = data.type;
                contData.value = "continued";
                newMemory.splice(++d, 0, contData); // insert after current element
                len++;
                data.size = data.size - contData.size;
            }

            setMemory(newMemory);
        };

        updateMemory(); // Initial update

        machine.onMemoryChange(updateMemory);
    }, []);

    return (
        <div className="content-center border-sky-500">
            <MemoryGrid memory={memory} />
            <FormInput machine={machine} />
        </div>
    );
}

export default App;
