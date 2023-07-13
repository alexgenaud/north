import { isInt, Mode, assert } from '../north/Util';
import Machine from '../north/Machine';
import Data from '../north/Data';


export default class Dictionary {
    private core: { [word: string]: number[] };
    private machine: Machine;

    constructor(machine: Machine) {
        this.core = {};
        this.machine = machine;
        this.loadCoreWords();
    }

    public addWordColonFunctionAddressList(word: string, action: number[]): number {
       const data: Data = new Data(action);
       data.is_fn_colon_array = true;
       return this.addWordData(word, data);
    }

    public addWordCoreConditional(word: string, action: (m: Machine) => void ): number {
       const data: Data = new Data(action);
       data.is_fn_core = true;
       data.is_fn_condition = true;
       return this.addWordData(word, data);
    }

    public addWordCoreImmediate(word: string, action: (m: Machine) => void ): number {
       const data: Data = new Data(action);
       data.is_fn_core = true;
       data.is_fn_immediate = true;
       return this.addWordData(word, data);
    }

    public addWordCoreFunction(word: string, action: (m: Machine) => void ): number {
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
        const actionAddress = this.machine.write(action);
        this.core[word].push(actionAddress);

        return actionAddress;
    }

    public getAction(word: string): Data | null {
        if (!(typeof word === 'string' && word.length > 0)) {
            throw new Error('Dictionary word must be a non-empty string');
        }

        const actionList = this.core[word];
        const address = actionList ? actionList[actionList.length - 1] : null;
        const result = (address != null) ? this.machine.read(address) : null;
        return result;
    }

    public getWordAddress(word: string): number | null {
        if (!(typeof word === 'string' && word.length > 0)) {
            throw new Error('Dictionary word must be a non-empty string');
        }

        const actionList = this.core[word];
        return actionList ? actionList[actionList.length - 1] : null;
    }

    private divideInt(m: Machine): void {
        const a = m.opstack.pop() as number;
        if (typeof a !== 'number' || a === 0) {
            throw new Error(`Divisor must be non-zero int. Was ${a}`);
        }

        const b = m.opstack.pop() as number;
        if (typeof b !== 'number') {
            throw new Error(`Numerator must be a number. Was ${b}`);
        }

        m.opstack.push(Math.floor(b / a));
    }

    private absoluteValue(m: Machine): void {
        const a = m.opstack.pop() as number;
        m.opstack.push(a >= 0 ? a : -a);
    }

    private mod(m: Machine): void {
        let d = m.opstack.pop() as number;
        assert( typeof d === 'number' && isInt(d) && d !== 0,
            'Modulo divisor must be non-zero number. Was ${d}');
        if (d < 0) d = -d;

        let n = m.opstack.pop() as number;
        assert( typeof n === 'number' && isInt(n),
            'Modulo numerator must be a number. Was ${n}');
        if (n < 0) n += d * n * (-1);

        m.opstack.push( (n % d) + 0 ); // -0 is possible ! :o
    }

    private compileStart(m: Machine): void {
        assert(m.costack.peek() === Mode.EXECUTE && m.compile_definition === null,
            'Start compilation from EXECUTE mode with no definition list');

        m.costack.push(Mode.COMPILE);
        m.compile_definition = [];
    }

    private compileEnd(dictionary: Dictionary): (m: Machine) => void {
        const getWordAddress = dictionary.getWordAddress.bind(dictionary);
        return (m: Machine) => {
            if (m.costack.peek() !== Mode.COMPILE
                    || m.compile_definition == null
                    || !Array.isArray(m.compile_definition)) {
                throw new Error(`Must end compilation in COMPILE mode: ${m.costack.peek()} with definition list: ${m.compile_definition}`);
            }
            const wordName = m.compile_definition.shift();
            const addressList: number[] = [];
            for (const token of m.compile_definition) {
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
                    throw new Error('Extant action must have number address');
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
            m.compile_definition = null;
            m.costack.pop();
            if (m.costack.peek() !== Mode.EXECUTE) {
                throw new Error('Expected to pop out of COMPILE into EXECUTE mode');
            }
        }
    }

    private conditionIf(m: Machine): void {
        const current = m.costack.peek();
        if (current === Mode.IGNORE || current === Mode.BLOCK) {
            m.costack.push(Mode.BLOCK);
        } else if (current === Mode.COMPILE) {
            m.costack.push(Mode.COMPILE);
        } else if (current === Mode.EXECUTE) {
            m.costack.push(m.opstack.pop() !== 0 ? Mode.EXECUTE : Mode.IGNORE);
        }
    }

    private conditionElse(m: Machine): void {
        const current = m.costack.peek();
        if (current === Mode.IGNORE) {
            m.costack.toggle(Mode.EXECUTE);
        } else if (current === Mode.EXECUTE) {
            m.costack.toggle(Mode.IGNORE);
        }
    }

    private conditionThen(m: Machine): void {
        if (m.costack.peek() === Mode.COMPILE) {
            throw new Error('Executed condition must be from EXECUTE or IGNORE but not COMPILE mode');
        }
        m.costack.pop(); // if EXECUTE else IGNORE else EXECUTE
    }

    // 220 CONSTANT LIMIT
    // The word LIMIT returns its value not its address
    private constInitMode(m: Machine): void {
        assert(m.costack.peek() === Mode.EXECUTE, "constInit expects to be in EXECUTE Mode. But was: ${m.costack.peek()}");
        m.costack.toggle(Mode.CONSTANT);
    }

    // (num val) CONST (name)
    // sets value at new address
    // associates dictionary[name] = address
    // dictionary.lookup(name) returns value (at address)
    // TODO push address to m.opstack
    public constInitWord(m: Machine): void {
        assert(m.costack.peek() === Mode.CONSTANT, "constInit expects to be in CONSTANT Mode. But was: ${m.costack.peek()}");
        assert(m.opstack.length > 1, "m.opstack must have at least two elements to pop. Has only ${m.opstack.length}");
        this.addWordI32(m.opstack.pop(), m.opstack.pop()); // name, early value
        m.costack.toggle(Mode.EXECUTE);
    }

    // VAR myVar
    private varInitMode(m: Machine): void {
        assert(m.costack.peek() === Mode.EXECUTE, "varInit expects to be in EXECUTE Mode. But was: ${m.costack.peek()}");
        m.costack.toggle(Mode.VARIABLE);
    }

    // VAR (name)
    // sets 0 at new address A
    // sets address A at new addess B
    // associates dictionary[name] = address B
    // dictionary.lookup(name) returns (address A) (value at address B)
    // TODO define var as the address of a CONST
    public varInitWord(m: Machine): void {
        assert(m.costack.peek() === Mode.VARIABLE, "varInit expects to be in VARIABLE Mode. But was: ${m.costack.peek()}");
        const addressOfValue = this.machine.write(new Data(0));
        this.addWordAddress(m.opstack.pop(), addressOfValue);
        m.costack.toggle(Mode.EXECUTE);
    }

    // ! takes the address of the var and the value to be stored
    // 42 myVar ! (sets myVar = 42)
    private varSetValAtAddress(dictionary: Dictionary): (m: Machine) => void {
        const getWordAddress = dictionary.getWordAddress.bind(dictionary);
        return (m: Machine) => {
            assert(m.costack.peek() === Mode.EXECUTE,
                "varSetValAtAddress expects to be in EXECUTE Mode. But was: ${m.costack.peek()}");
            assert(m.opstack.length > 1, "m.opstack must have at least two elements to pop. Has only ${m.opstack.length}");
            const addressOfVar = m.opstack.pop();
            const value = m.opstack.pop();
            if (addressOfVar == null) { // == or undefined double==equal
                throw new Error("Unexpected address: ${addressOfVar} of variable: ${varName} with value: ${value}");
            }
            // TODO write variable length int?
            this.machine.write(new Data(value), addressOfVar);
        }
    }

    // @ retrieves the value of the variable
    // myVar @ (returns 42 on the m.opstack)
    private varGetValAtAddress(dictionary: Dictionary): (m: Machine) => void {
        const getWordAddress = dictionary.getWordAddress.bind(dictionary);
        return (m: Machine) => {
            assert(m.costack.peek() === Mode.EXECUTE, "varSetValAtAddress expects to be in EXECUTE Mode. But was: ${m.costack.peek()}");
            assert(m.opstack.length > 0, "m.opstack must have at least one element to pop. Has only ${m.opstack.length}");
            const addressOfVar = m.opstack.pop();
            if (addressOfVar == null) { // double== or undefined
                throw new Error(`Unexpected address: ${addressOfVar}`);
            }
            const data = this.machine.read(addressOfVar);
            if (data == null || !data.is_integer) {
                throw new Error(`Must be a valid integer at address: ${addressOfVar} was data: ${data}`);
            } else if (data.value == null || !isInt(data.value) || typeof data.value !== 'number') {
                throw new Error(`Unexpected type: ${typeof data.value} of value: ${data.value} at address: ${addressOfVar}`);
            }
            m.opstack.push(data.value);
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
        this.addWordCoreFunction('DROP', (m: Machine) => m.opstack.pop());
        this.addWordCoreFunction('DUP', (m: Machine) => m.opstack.push(m.opstack.peek()));
        this.addWordCoreFunction('NOT', (m: Machine) => m.opstack.push(~m.opstack.pop()));
        this.addWordCoreFunction('ABS', this.absoluteValue);
        this.addWordCoreFunction('=0', (m: Machine) => m.opstack.push(m.opstack.pop() === 0 ? 1 : 0));
        this.addWordCoreFunction('<0', (m: Machine) => m.opstack.push(m.opstack.pop() < 0 ? 1 : 0));
        this.addWordCoreFunction('>0', (m: Machine) => m.opstack.push(m.opstack.pop() > 0 ? 1 : 0));

        // 0 no pops
        this.addWordCoreFunction('PS', (m: Machine) => console.log(m.opstack));
        this.addWordCoreFunction('PD', (m: Machine) => console.log(this));
        this.addWordCoreFunction('PM', (m: Machine) => console.log(this.machine));

        // 2 pop pops
        this.addWordCoreFunction('+', (m: Machine) => m.opstack.push(m.opstack.pop() + m.opstack.pop()));
        this.addWordCoreFunction('-', (m: Machine) => m.opstack.push(m.opstack.pop(-2) - m.opstack.pop()));
        this.addWordCoreFunction('*', (m: Machine) => m.opstack.push(m.opstack.pop() * m.opstack.pop()));
        this.addWordCoreFunction('/', this.divideInt);
        this.addWordCoreFunction('=', (m: Machine) => m.opstack.push(m.opstack.pop() === m.opstack.pop() ? 1 : 0));
        this.addWordCoreFunction('<', (m: Machine) => m.opstack.push(m.opstack.pop() > m.opstack.pop() ? 1 : 0));
        this.addWordCoreFunction('>', (m: Machine) => m.opstack.push(m.opstack.pop() < m.opstack.pop() ? 1 : 0));
        this.addWordCoreFunction('OVER', (m: Machine) => m.opstack.push(m.opstack.peek(-2)));
        this.addWordCoreFunction('SWAP', (m: Machine) => m.opstack.push(m.opstack.pop(-2)));
        this.addWordCoreFunction('AND', (m: Machine) => m.opstack.push(m.opstack.pop() & m.opstack.pop()));
        this.addWordCoreFunction('OR', (m: Machine) => m.opstack.push(m.opstack.pop() | m.opstack.pop()));
        this.addWordCoreFunction('XOR', (m: Machine) => m.opstack.push(m.opstack.pop() ^ m.opstack.pop()));
        this.addWordCoreFunction('<=0', (m: Machine) => m.opstack.push(m.opstack.pop() <= 0 ? 1 : 0));
        this.addWordCoreFunction('>=0', (m: Machine) => m.opstack.push(m.opstack.pop() >= 0 ? 1 : 0));
        this.addWordCoreFunction('MOD', this.mod);

        // 3 pop pop pops
        this.addWordCoreFunction('ROT', (m: Machine) => m.opstack.push(m.opstack.pop(-3)));
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
