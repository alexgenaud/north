import FormInput from "./FormInput";
import MemoryGrid from "./MemoryGrid";

function App() {
    console.log("App constructor");
    return (
        <div className="content-center border-sky-500">
            <MemoryGrid />
            <FormInput />
        </div>
    );
}

export default App;
