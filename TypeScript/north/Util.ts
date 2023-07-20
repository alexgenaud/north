export enum Mode {
    EXECUTE = 1,
    COMPILE = 2,
    IGNORE = 3, // can be toggled with EXECUTE in same layer
    BLOCK = 4, // if parent is IGNORED then child layers are blocked
    VARIABLE = 5, // set variable name with next token
    CONSTANT = "6CONSTANT", // set constant name with next token, value from earlier
    // maybe need COMMENTS
}

export function isInt(token: any): boolean {
    if (typeof token === "number") {
        return true;
    }
    if (typeof token !== "string") {
        return false;
    }
    if (
        token.match(/^\d+$/g) ||
        (token.startsWith("-") && token.slice(1).match(/^\d+$/g))
    ) {
        return true;
    }
    return false;
}

export function assert(expect: boolean, message: string): void {
    if (!expect) {
        console.error(message);
        throw new Error("Assertion failed: " + message);
    }
}

export function splitToI8Bytes(address: number): { low: number; high: number } {
    const low = address & 0xff; // Extract the lower 8 bits
    const high = (address >> 8) & 0xff; // Shift right to get the higher 8 bits and then extract them
    return { low, high };
}
