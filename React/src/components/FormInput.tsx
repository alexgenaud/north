import Machine from "../../../TypeScript/north/Machine";
import { ChangeEvent, FormEvent, useState } from "react";

interface Props {
    machine: Machine;
}

function FormInput({ machine }: Props) {
    const [viewState, setViewState] = useState({
        input: "",
        opstack: "",
        costack: machine.coStackString(),
    });
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (e.type === "submit" && viewState.input && viewState.input.trim()) {
            machine.executeInputBuffer(viewState.input);
            setViewState({
                input: "",
                opstack: machine.opStackString(),
                costack: machine.coStackString(),
            });
        }
        //        e.target.focus();
    };

    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (
            // To eliminate "Mac  " => "Mac. " behavior.
            viewState.input &&
            e.target.value &&
            viewState.input.length > 0 &&
            viewState.input.length + 1 === e.target.value.length &&
            viewState.input.slice(-1) === " " &&
            e.target.value.slice(-2) === ". "
        ) {
            e.target.value = viewState.input + " ";
        }
        setViewState({
            input: e.target.value,
            opstack: viewState.opstack,
            costack: viewState.costack,
        });
        e.target.focus();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
                <label className="text-slate-500">Op Stack:</label>
                <p className="text-slate-500">{viewState.opstack}</p>
            </div>
            <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
                <label className="text-slate-500">Co Stack:</label>
                <p className="text-slate-500">{viewState.costack}</p>
            </div>
            <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
                <label className="text-slate-500">User Input:</label>
                <input
                    className="bg-slate-100 pl-2"
                    type="text"
                    required
                    value={viewState.input}
                    onChange={handleInput}
                />
            </div>
        </form>
    );
}

export default FormInput;
