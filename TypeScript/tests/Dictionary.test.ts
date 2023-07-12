import Data from '../north/Data';
import Dictionary from '../north/Dictionary';
import Machine from '../north/Machine';
import Stack from '../north/Stack';

describe('Dictionary', () => {
    let dictionary: Dictionary;

    beforeEach(() => {
        const machine = new Machine();
        dictionary = machine.dictionary;
    });

    it('should add a word and retrieve its data', () => {
        const data: Data = new Data([1,2,3]);
        const word = 'test';
        dictionary.addWordData(word, data);
        expect(dictionary.getAction(word)).toBe(data);

        dictionary.addWordColonFunctionAddressList('test2', [5,6,7]);
        const dataBack: Data | null = dictionary.getAction('test2');
        expect(dataBack).not.toBeNull();
        expect(dataBack!.is_fn_colon_array).toBe(true);
        expect(dataBack!.value).toStrictEqual([5,6,7]);
    });

    it('should return null for non-existing word', () => {
        expect(dictionary.getAction('nonexisting')).toBeNull();
    });

    it('should divide integers with integer result', () => {
        const stack = new Stack();
        stack.push(13);
        stack.push(3);
        dictionary['divideInt'](stack);
        expect(stack.pop()).toBe(4);
    });

    it('should throw an error when dividing by zero', () => {
        const stack = new Stack();
        stack.push(10);
        stack.push(0);
        expect(() => {
            dictionary['divideInt'](stack);
        }).toThrowError('Divisor must be non-zero int');
    });

    it('should throw an error when numerator not a number', () => {
        const stack = new Stack();
        stack.push("ABC");
        stack.push(7);
        expect(() => {
            dictionary['divideInt'](stack);
        }).toThrowError('Numerator must be a number');
    });
});
