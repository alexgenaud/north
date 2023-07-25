import { isInt, assert, Mode } from "../north/Util";

export default class Buffer {
    private stack: string[];

    public constructor() {
        this.stack = [];
    }

    public push(value: string | string[]): void {
        if (typeof value === "string") {
            this.stack.push(value + ""); // last end
        } else if (Array.isArray(value)) {
            this.stack.push(...value); // extend end
        } else {
            throw new Error("Unexpected type pushed into buffer: " + value);
        }
    }

    public shift(): string | undefined {
        assert(this.stack.length > 0, "Buffer must have a word to pull");
        return this.stack.shift(); // first
    }

    public peek(): string | undefined {
        assert(this.stack.length > 0, "Buffer must have a word to peek");
        if (this.stack.length < 1) return undefined;
        return this.stack[0]; // first
    }

    public isEmpty(): boolean {
        return this.stack.length === 0;
    }

    get length(): number {
        return this.stack.length;
    }

    public toString(): string {
        return this.stack.join(" ");
    }
}
