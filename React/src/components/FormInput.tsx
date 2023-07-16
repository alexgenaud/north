import "./custom.scss";
import Machine from "../../../TypeScript/north/Machine";
import { useState } from "react";

interface Props {
    machine: Machine;
}

function FormInput({ machine }: Props) {
    const [opstack, setOpstack] = useState("");
    const [costack, setCostack] = useState("");
    const [input, setInput] = useState("");

    const handleInput = (e: any) => {
        e.preventDefault();

        if (!input || !input.trim()) {
            setInput("");
            return;
        }

        console.log("FormIntput before Machine.executeInputBuffer $input");
        machine.executeInputBuffer(input);
        console.log("FormIntput after Machine.executeInputBuffer");

        setOpstack(machine.opStackString());
        setCostack(machine.coStackString());
        setInput("");
    };

    return (
        <div className="">
            <form onSubmit={handleInput}>
                <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
                    <div>
                        <div className="text-xl font-medium text-black">
                            Op Stack: {opstack}
                        </div>
                        <p className="text-slate-500">{opstack}</p>
                    </div>
                </div>
                <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
                    <div>
                        <div className="text-xl font-medium text-black">
                            Co Stack: {costack}
                        </div>
                        <p className="text-slate-500">{costack}</p>
                    </div>
                </div>
                <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
                    <div>
                        <div className="text-xl font-medium text-black">
                            User Input: {input}
                        </div>
                        <label className="text-slate-500">User Input:</label>
                        <input
                            className="bg-slate-100"
                            type="text"
                            required
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <p>{input}</p>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default FormInput;
