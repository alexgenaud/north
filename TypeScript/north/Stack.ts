import { isInt, assert, Mode } from '../north/Util';


export default class Stack {
    private stack: (number | string)[];
    private current_index: number;
    mode: Mode[] = [Mode.EXECUTE];
    compile_definition: any[] | null;

    constructor(initstack?: string | string[] | undefined) {
        if (Array.isArray(initstack)) {
            this.stack = initstack;
        } else if (typeof initstack === 'string') {
            this.stack = initstack.split(' ');
        } else {
            this.stack = [];
        }
        this.current_index = 0;
        this.compile_definition = null;
    }

    modePeek(): Mode {
        assert(this.mode.length > 0, 'Mode stack must have enums to peek');
        return this.mode[this.mode.length -1];
    }

    modePop(index = -1): Mode {
        assert(this.mode.length > 0, 'Mode stack must have enums to pop');
        if (index === undefined || index === -1 || index === this.mode.length -1) {
            return this.mode.pop()!;
        } else if (index < 0) {
            return this.mode.splice(this.mode.length + index, 1)[0];
        }
        return this.mode.splice(index, 1)[0];
    }

    modePush(mode: Mode): void {
        assert(Object.values(Mode).includes(mode), 'Mode stack must only contain Mode enums');
        this.mode.push(mode);
    }

    modeToggle(next: Mode): void {
        assert(Object.values(Mode).includes(next), 'Must set transition mode');
        this.mode[this.mode.length - 1] = next;
    }

    push(value: number | string): void {
        assert(typeof value === 'number' || typeof value === 'string', 'Stack token must be a string or number');
        if (isInt(value)) {
            this.stack.push( Number(value) );
            //this.stack.push(parseInt(value, 10));
        } else {
            this.stack.push(value + "");
        }
    }

    extend(list_value: any[]): void {
        assert(Array.isArray(list_value), 'Extend stack with an array only');
        this.stack.push(...list_value);
    }

    pop(index = -1): any {
        assert(this.stack.length > 0, 'Stack must have tokens to pop');
        if (index === undefined || index === -1 || index === this.stack.length -1) {
            return this.stack.pop();
        } else if (index < 0) {
            return this.stack.splice(this.stack.length + index, 1)[0];
        }
        return this.stack.splice(index, 1)[0];
    }

    peek(index = -1): any {
        assert(this.stack.length > 0, 'Stack must have tokens to peek');
        if (index < 0) {
            index = this.stack.length + index;
        }
        return this.stack[index];
    }

    is_empty(): boolean {
        return this.stack.length === 0;
    }

    get length(): number {
        return this.stack.length;
    }

    toString(): string {
        return this.stack.join(' ');
    }

    [Symbol.iterator](): Iterator<number | string> {
        this.current_index = 0;
        return this;
    }

    next(): IteratorResult<number | string> {
        if (this.current_index < this.stack.length) {
            const value = this.stack[this.current_index];
            this.current_index += 1;
            return { value, done: false };
        } else {
            return { done: true } as IteratorResult<number | string>;
        }
    }
}
