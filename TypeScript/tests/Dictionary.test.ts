import Data from '../north/Data';
import Dictionary from '../north/Dictionary';
import Machine from '../north/Machine';
import Stack from '../north/Stack';

describe('Dictionary', () => {
    let dictionary: Dictionary;
    let machine: Machine;

    beforeEach(() => {
        machine = new Machine();
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

});
