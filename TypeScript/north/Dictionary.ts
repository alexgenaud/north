import { isInt, Mode, assert } from '../north/Util';
import Memory from '../north/Memory'; // Assuming you have a Memory class implementation
import Stack from '../north/Stack'; // Assuming you have a Memory class implementation

export type Action = ((stack: Stack) => void) | number | number[];

export default class Dictionary {
    private core: { [word: string]: number[] };
    private memory: Memory;

    constructor(memory: Memory) {
        this.core = {};
        this.memory = memory;
        this.loadCoreWords();
    }

    public addWord(word: string, action: Action): number {
        if (!(typeof word === 'string' && word.length > 0)) {
            throw new Error('Dictionary word must be a non-empty string');
        } else if (!(typeof action === 'number' || Array.isArray(action) ||
                     typeof action === 'function')) {
            throw new Error('Dictionary action must be a number, an array, or a function');
        }

        if (!this.core[word]) {
            this.core[word] = [];
        }

        const actionAddress = this.memory.write(action);
        this.core[word].push(actionAddress);

        return actionAddress;
    }

    public getAction(word: string): Action | null {
        if (!(typeof word === 'string' && word.length > 0)) {
            throw new Error('Dictionary word must be a non-empty string');
        }

        const actionList = this.core[word];
        const memoryAddress = actionList ? actionList[actionList.length - 1] : null;
        const result = (memoryAddress != null) ? this.memory.read(memoryAddress) : null;
        return result;
    }

    public getWordAddress(word: string): number | null {
        if (!(typeof word === 'string' && word.length > 0)) {
            throw new Error('Dictionary word must be a non-empty string');
        }

        const actionList = this.core[word];
        return actionList ? actionList[actionList.length - 1] : null;
    }

    private divideInt(stack: Stack): void {
        const a = stack.pop() as number;
        if (typeof a !== 'number') {
            throw new Error(`Int / divisor must be a number. Was ${a}`);
        }
        if (a === 0) {
            throw new Error('Divide by zero');
        }

        const b = stack.pop() as number;
        if (typeof b !== 'number') {
            throw new Error(`Int / numerator must be a number. Was ${b}`);
        }

        stack.push(Math.floor(b / a));
    }

    private absoluteValue(stack: Stack): void {
        const a = stack.pop() as number;
        stack.push(a >= 0 ? a : -a);
    }

    private mod(stack: Stack): void {
        const d = stack.pop() as number;
        assert( typeof d === 'number' && isInt(d) && d !== 0,
            'Modulo divisor must be non-zero number. Was ${d}');
        const absD = d >= 0 ? d : -d;

        let n = stack.pop() as number;
        assert( typeof n === 'number' && isInt(n),
            'Modulo numerator must be a number. Was ${n}');

        while (n < -10000000000) n += absD * 10000000000;
        while (n < -100000) n += absD * 100000;
        while (n < 0) n += absD * 100;

        stack.push( (n % absD) + 0 ); // -0 is possible ! :o
    }

    private compileStart(stack: Stack): void {
        if (stack.modePeek() !== Mode.EXECUTE || stack.compile_definition !== null) {
            throw new Error('Start compilation from EXECUTE mode with no definition list');
        }

        stack.modePush(Mode.COMPILE);
        stack.compile_definition = [];
    }

    private compileEndClosure(dictionary: Dictionary): (stack: Stack) => void {
        const getWordAddress = dictionary.getWordAddress.bind(dictionary);
        return (stack: Stack) => {
            if (stack.modePeek() !== Mode.COMPILE || !Array.isArray(stack.compile_definition)) {
                throw new Error('End compilation in COMPILE mode with a definition list');
            }
            const wordName = stack.compile_definition.shift();
            const addressList: number[] = [];
            for (const token of stack.compile_definition) {
                if (!(typeof token === 'string' && token.length > 0)) {
                    throw new Error('Compiled colon word must contain non-empty numbers or words');
                }
                const address = getWordAddress(token);
                if (address === null && isInt(token)) {
                    const newAddress = this.addWord(token, parseInt(token, 10));
                    addressList.push(newAddress);
                    continue;
                }
                if (typeof address !== 'number') {
                    throw new Error('Extant action must have a memory address');
                }
                const action = this.getAction(token);
                if (typeof action !== 'number' && !Array.isArray(action) && typeof action !== 'function') {
                    throw new Error(`Word \`${token}\` action must be a number, an array, or a function`);
                }
                if (typeof action === 'function') {
                    addressList.push(address);
                } else if (typeof action === 'number') { // new mutable constant number
                    addressList.push(address);
                } else if (Array.isArray(action)) { // compiled word list of addresses
                    addressList.push(...action); // INLINE
                }
            }
            const address = this.addWord(wordName as string, addressList);
            stack.compile_definition = null;
            stack.modePop();
            if (stack.modePeek() !== Mode.EXECUTE) {
                throw new Error('Expected to pop out of COMPILE into EXECUTE mode');
            }
        }
    }

    private conditionIf(stack: Stack): void {
        const current = stack.modePeek();
        if (current === Mode.IGNORE || current === Mode.BLOCK) {
            stack.modePush(Mode.BLOCK);
        } else if (current === Mode.COMPILE) {
            stack.modePush(Mode.COMPILE);
        } else if (current === Mode.EXECUTE) {
            stack.modePush(stack.pop() !== 0 ? Mode.EXECUTE : Mode.IGNORE);
        }
    }

    private conditionElse(stack: Stack): void {
        const current = stack.modePeek();
        if (current === Mode.IGNORE) {
            stack.modeToggle(Mode.EXECUTE);
        } else if (current === Mode.EXECUTE) {
            stack.modeToggle(Mode.IGNORE);
        }
    }

    private conditionThen(stack: Stack): void {
        if (stack.modePeek() === Mode.COMPILE) {
            throw new Error('Executed condition must be from EXECUTE or IGNORE but not COMPILE mode');
        }
        stack.modePop(); // if EXECUTE else IGNORE else EXECUTE
    }

    private loadCoreWords(): void {
        // 1 pop
        this.addWord('IF', this.conditionIf);
        this.addWord('ELSE', this.conditionElse);
        this.addWord('THEN', this.conditionThen);
        this.addWord(':', this.compileStart);
        this.addWord(';', this.compileEndClosure(this) );
        this.addWord('DROP', (stack: Stack) => stack.pop());
        this.addWord('DUP', (stack: Stack) => stack.push(stack.peek()));
        this.addWord('NOT', (stack: Stack) => stack.push(~stack.pop()));
        this.addWord('ABS', this.absoluteValue);
        this.addWord('=0', (stack: Stack) => stack.push(stack.pop() === 0 ? 1 : 0));
        this.addWord('<0', (stack: Stack) => stack.push(stack.pop() < 0 ? 1 : 0));
        this.addWord('>0', (stack: Stack) => stack.push(stack.pop() > 0 ? 1 : 0));

        // 0 no pops
        this.addWord('PS', (stack: Stack) => console.log(stack));
        this.addWord('PD', (stack: Stack) => console.log(this));
        this.addWord('PM', (stack: Stack) => console.log(this.memory));

        // 2 pop pops
        this.addWord('+', (stack: Stack) => stack.push(stack.pop() + stack.pop()));
        this.addWord('-', (stack: Stack) => stack.push(stack.pop(-2) - stack.pop()));
        this.addWord('*', (stack: Stack) => stack.push(stack.pop() * stack.pop()));
        this.addWord('/', this.divideInt);
        this.addWord('=', (stack: Stack) => stack.push(stack.pop() === stack.pop() ? 1 : 0));
        this.addWord('<', (stack: Stack) => stack.push(stack.pop() > stack.pop() ? 1 : 0));
        this.addWord('>', (stack: Stack) => stack.push(stack.pop() < stack.pop() ? 1 : 0));
        this.addWord('OVER', (stack: Stack) => stack.push(stack.peek(-2)));
        this.addWord('SWAP', (stack: Stack) => stack.push(stack.pop(-2)));
        this.addWord('AND', (stack: Stack) => stack.push(stack.pop() & stack.pop()));
        this.addWord('OR', (stack: Stack) => stack.push(stack.pop() | stack.pop()));
        this.addWord('XOR', (stack: Stack) => stack.push(stack.pop() ^ stack.pop()));
        this.addWord('<=0', (stack: Stack) => stack.push(stack.pop() <= 0 ? 1 : 0));
        this.addWord('>=0', (stack: Stack) => stack.push(stack.pop() >= 0 ? 1 : 0));
        this.addWord('MOD', this.mod);

        // 3 pop pop pops
        this.addWord('ROT', (stack: Stack) => stack.push(stack.pop(-3)));
    }

    toString(): string {
        const indent = '';
        let result = '';
        for (const [key, value] of Object.entries(this.core)) {
            result += `${indent}${key}: `;
            if (Array.isArray(value)) {
                const formattedItems = value.map((item) => (typeof item === 'function' ? 'call' : String(item)));
                result += `[ ${formattedItems.join(', ')} ]`;
            } else if (typeof value === 'object') {
                result += 'dict\n';
            } else if (typeof value === 'function') {
                result += 'call\n';
            } else {
                result += String(value);
            }
            result += '\n';
        }
        return result;
    }
}
