import FormInput from "./FormInput";
import MemoryGrid from "./MemoryGrid";
import Machine from "../../../TypeScript/north/Machine";
import { useEffect, useState } from "react";
import { DataBlock } from "../../../TypeScript/north/types";

const machine: Machine = new Machine();

function App() {
    const [memory, setMemory] = useState<DataBlock[]>([]);

    useEffect(() => {
        const updateMemory = () => {
            const newMemory: DataBlock[] = machine.dumpData();
            setMemory(newMemory);
        };

        updateMemory(); // Initial update

        machine.onMemoryChange(updateMemory);
    }, []);

    return (
        <div className="content-center border-sky-500">
            <MemoryGrid memory={memory} />;
            <FormInput machine={machine} />;
        </div>
    );
}

export default App;
