import { isInt, Mode, assert } from '../north/Util';
import Memory from '../north/Memory'; // Assuming you have a Memory class implementation
import Stack from '../north/Stack'; // Assuming you have a Memory class implementation
import Data from '../north/Data'; // Assuming you have a Memory class implementation


export default class Dictionary {
    private core: { [word: string]: number[] };
    private memory: Memory;

    constructor(memory: Memory) {
        this.core = {};
        this.memory = memory;
        this.loadCoreWords();
    }

    public addWordColonFunctionAddressList(word: string, action: number[]): number {
       const data: Data = new Data(action);
       data.is_fn_colon_array = true;
       return this.addWordData(word, data);
    }

    public addWordCoreConditional(word: string, action: (stack: Stack) => void ): number {
       const data: Data = new Data(action);
       data.is_fn_core = true;
       data.is_fn_condition = true;
       return this.addWordData(word, data);
    }

    public addWordCoreImmediate(word: string, action: (stack: Stack) => void ): number {
       const data: Data = new Data(action);
       data.is_fn_core = true;
       data.is_fn_immediate = true;
       return this.addWordData(word, data);
    }

    public addWordCoreFunction(word: string, action: (stack: Stack) => void ): number {
       const data: Data = new Data(action);
       data.is_fn_core = true;
       return this.addWordData(word, data);
    }

    public addWordAddress(word: string, action: number): number {
        return this.addWordI32(word, action);
    }

    public addWordI8(word: string, action: number): number {
        return this.addWordI32(word, action);
    }

    public addWordI16(word: string, action: number): number {
        return this.addWordI32(word, action);
    }

    public addWordI32(word: string, action: number): number {
       const data: Data = new Data(action);
       data.is_integer = true;
       return this.addWordData(word, data);
    }

    public addWordData(word: string, action: Data): number {
        if (!this.core[word]) {
            this.core[word] = [];
        }
        const actionAddress = this.memory.write(action);
        this.core[word].push(actionAddress);

        return actionAddress;
    }

    public getAction(word: string): Data | null {
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
        if (typeof a !== 'number' || a === 0) {
            throw new Error(`Divisor must be non-zero int. Was ${a}`);
        }

        const b = stack.pop() as number;
        if (typeof b !== 'number') {
            throw new Error(`Numerator must be a number. Was ${b}`);
        }

        stack.push(Math.floor(b / a));
    }

    private absoluteValue(stack: Stack): void {
        const a = stack.pop() as number;
        stack.push(a >= 0 ? a : -a);
    }

    private mod(stack: Stack): void {
        let d = stack.pop() as number;
        assert( typeof d === 'number' && isInt(d) && d !== 0,
            'Modulo divisor must be non-zero number. Was ${d}');
        if (d < 0) d = -d;

        let n = stack.pop() as number;
        assert( typeof n === 'number' && isInt(n),
            'Modulo numerator must be a number. Was ${n}');
        if (n < 0) n += d * n * (-1);

        stack.push( (n % d) + 0 ); // -0 is possible ! :o
    }

    private compileStart(stack: Stack): void {
        assert(stack.modePeek() === Mode.EXECUTE && stack.compile_definition === null,
            'Start compilation from EXECUTE mode with no definition list');

        stack.modePush(Mode.COMPILE);
        stack.compile_definition = [];
    }

    private compileEnd(dictionary: Dictionary): (stack: Stack) => void {
        const getWordAddress = dictionary.getWordAddress.bind(dictionary);
        return (stack: Stack) => {
            if (stack.modePeek() !== Mode.COMPILE
                    || stack.compile_definition == null
                    || !Array.isArray(stack.compile_definition)) {
                throw new Error(`Must end compilation in COMPILE mode: ${stack.modePeek()} with definition list: ${stack.compile_definition}`);
            }
            const wordName = stack.compile_definition.shift();
            const addressList: number[] = [];
            for (const token of stack.compile_definition) {
                if (!(typeof token === 'string' && token.length > 0)) {
                    throw new Error('Compiled colon word must contain non-empty numbers or words');
                }
                const address = getWordAddress(token);
                if (address === null && isInt(token)) {
                    //const newAddress = this.addWordI8(token, parseInt(token, 10));
                    const newAddress = this.addWordI8(token, parseInt(token, 10));
                    addressList.push(newAddress);
                    continue;
                }
                if (typeof address !== 'number') {
                    throw new Error('Extant action must have a memory address');
                }
                const data = this.getAction(token);
                if (data == null || data.value == null) {
                    throw new Error(`Defined word: ${token} with address: ${address} must have data`);
                } else if (typeof data.value !== 'number'
                        && !Array.isArray(data.value)
                        && typeof data.value !== 'function') {
                    throw new Error(`Word \`${token}\` action must be a number, an array, or a function`);
                }

                if (data.is_fn_core && typeof data.value === 'function') {
                    addressList.push(address);
                } else if (data.is_integer && typeof data.value === 'number') { // new mutable constant number
                    addressList.push(address);
                } else if (data.is_string && typeof data.value === 'string') { // new mutable constant number
                    addressList.push(address);
                } else if (data.is_fn_colon_array && Array.isArray(data.value)) { // compiled word list of addresses
                    addressList.push(...data.value); // INLINE
                } else {
                    throw new Error(`Unexpected data: ${data} at address: ${address} of word: ${token}`);
                }
            }
            this.addWordColonFunctionAddressList(wordName as string, addressList); // returns address, ignored
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

    // 220 CONSTANT LIMIT
    // The word LIMIT returns its value not its address
    private constInitMode(stack: Stack): void {
        assert(stack.modePeek() === Mode.EXECUTE, "constInit expects to be in EXECUTE Mode. But was: ${stack.modePeek()}");
        stack.modeToggle(Mode.CONSTANT);
    }

    // (num val) CONST (name)
    // sets value at new address
    // associates dictionary[name] = address
    // dictionary.lookup(name) returns value (at address)
    // TODO push address to stack
    public constInitWord(stack: Stack): void {
        assert(stack.modePeek() === Mode.CONSTANT, "constInit expects to be in CONSTANT Mode. But was: ${stack.modePeek()}");
        assert(stack.length > 1, "stack must have at least two elements to pop. Has only ${stack.length}");
        this.addWordI32(stack.pop(), stack.pop()); // name, early value
        stack.modeToggle(Mode.EXECUTE);
    }

    // VAR myVar
    private varInitMode(stack: Stack): void {
        assert(stack.modePeek() === Mode.EXECUTE, "varInit expects to be in EXECUTE Mode. But was: ${stack.modePeek()}");
        stack.modeToggle(Mode.VARIABLE);
    }

    // VAR (name)
    // sets 0 at new address A
    // sets address A at new addess B
    // associates dictionary[name] = address B
    // dictionary.lookup(name) returns (address A) (value at address B)
    // TODO define var as the address of a CONST
    public varInitWord(stack: Stack): void {
        assert(stack.modePeek() === Mode.VARIABLE, "varInit expects to be in VARIABLE Mode. But was: ${stack.modePeek()}");
        const addressOfValue = this.memory.write(new Data(0));
        this.addWordAddress(stack.pop(), addressOfValue);
        stack.modeToggle(Mode.EXECUTE);
    }

    // ! takes the address of the var and the value to be stored
    // 42 myVar ! (sets myVar = 42)
    private varSetValAtAddress(dictionary: Dictionary): (stack: Stack) => void {
        const getWordAddress = dictionary.getWordAddress.bind(dictionary);
        return (stack: Stack) => {
            assert(stack.modePeek() === Mode.EXECUTE,
                "varSetValAtAddress expects to be in EXECUTE Mode. But was: ${stack.modePeek()}");
            assert(stack.length > 1, "stack must have at least two elements to pop. Has only ${stack.length}");
            const addressOfVar = stack.pop();
            const value = stack.pop();
            if (addressOfVar == null) { // == or undefined double==equal
                throw new Error("Unexpected address: ${addressOfVar} of variable: ${varName} with value: ${value}");
            }
            // TODO write variable length int?
            this.memory.write(new Data(value), addressOfVar);
        }
    }

    // @ retrieves the value of the variable
    // myVar @ (returns 42 on the stack)
    private varGetValAtAddress(dictionary: Dictionary): (stack: Stack) => void {
        const getWordAddress = dictionary.getWordAddress.bind(dictionary);
        return (stack: Stack) => {
            assert(stack.modePeek() === Mode.EXECUTE, "varSetValAtAddress expects to be in EXECUTE Mode. But was: ${stack.modePeek()}");
            assert(stack.length > 0, "stack must have at least one element to pop. Has only ${stack.length}");
            const addressOfVar = stack.pop();
            if (addressOfVar == null) { // double== or undefined
                throw new Error(`Unexpected address: ${addressOfVar}`);
            }
            const value = this.memory.readI32(addressOfVar);
            if (typeof value !== 'number') {
                throw new Error(`Unexpected type: ${typeof value} of value: ${value} at address: ${addressOfVar}`);
            }
            stack.push(value);
        }
    }

    private loadCoreWords(): void {
        // 0 no pops
        for (let i=0; i<=2; i++) this.addWordI8(''+i, i);

        // 1 pop
        this.addWordCoreConditional('IF', this.conditionIf);
        this.addWordCoreConditional('ELSE', this.conditionElse);
        this.addWordCoreConditional('THEN', this.conditionThen);
        this.addWordCoreFunction(':', this.compileStart);
        this.addWordCoreImmediate(';', this.compileEnd(this) );
        this.addWordCoreFunction('CONST', this.constInitMode);
        this.addWordCoreFunction('VAR', this.varInitMode);
        this.addWordCoreFunction('!', this.varSetValAtAddress(this));
        this.addWordCoreFunction('@', this.varGetValAtAddress(this));
        this.addWordCoreFunction('DROP', (stack: Stack) => stack.pop());
        this.addWordCoreFunction('DUP', (stack: Stack) => stack.push(stack.peek()));
        this.addWordCoreFunction('NOT', (stack: Stack) => stack.push(~stack.pop()));
        this.addWordCoreFunction('ABS', this.absoluteValue);
        this.addWordCoreFunction('=0', (stack: Stack) => stack.push(stack.pop() === 0 ? 1 : 0));
        this.addWordCoreFunction('<0', (stack: Stack) => stack.push(stack.pop() < 0 ? 1 : 0));
        this.addWordCoreFunction('>0', (stack: Stack) => stack.push(stack.pop() > 0 ? 1 : 0));

        // 0 no pops
        this.addWordCoreFunction('PS', (stack: Stack) => console.log(stack));
        this.addWordCoreFunction('PD', (stack: Stack) => console.log(this));
        this.addWordCoreFunction('PM', (stack: Stack) => console.log(this.memory));

        // 2 pop pops
        this.addWordCoreFunction('+', (stack: Stack) => stack.push(stack.pop() + stack.pop()));
        this.addWordCoreFunction('-', (stack: Stack) => stack.push(stack.pop(-2) - stack.pop()));
        this.addWordCoreFunction('*', (stack: Stack) => stack.push(stack.pop() * stack.pop()));
        this.addWordCoreFunction('/', this.divideInt);
        this.addWordCoreFunction('=', (stack: Stack) => stack.push(stack.pop() === stack.pop() ? 1 : 0));
        this.addWordCoreFunction('<', (stack: Stack) => stack.push(stack.pop() > stack.pop() ? 1 : 0));
        this.addWordCoreFunction('>', (stack: Stack) => stack.push(stack.pop() < stack.pop() ? 1 : 0));
        this.addWordCoreFunction('OVER', (stack: Stack) => stack.push(stack.peek(-2)));
        this.addWordCoreFunction('SWAP', (stack: Stack) => stack.push(stack.pop(-2)));
        this.addWordCoreFunction('AND', (stack: Stack) => stack.push(stack.pop() & stack.pop()));
        this.addWordCoreFunction('OR', (stack: Stack) => stack.push(stack.pop() | stack.pop()));
        this.addWordCoreFunction('XOR', (stack: Stack) => stack.push(stack.pop() ^ stack.pop()));
        this.addWordCoreFunction('<=0', (stack: Stack) => stack.push(stack.pop() <= 0 ? 1 : 0));
        this.addWordCoreFunction('>=0', (stack: Stack) => stack.push(stack.pop() >= 0 ? 1 : 0));
        this.addWordCoreFunction('MOD', this.mod);

        // 3 pop pop pops
        this.addWordCoreFunction('ROT', (stack: Stack) => stack.push(stack.pop(-3)));
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
