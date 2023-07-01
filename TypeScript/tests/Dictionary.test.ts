//import { isInt, Mode } from '../north/Util';
import Stack from '../north/Stack';
import Memory from '../north/Memory';
import Dictionary, { Action } from '../north/Dictionary';

describe('Dictionary', () => {
  let dictionary: Dictionary;
  let memory: Memory;

  beforeEach(() => {
    memory = new Memory();
    dictionary = new Dictionary(memory);
  });

  it('should add a word and retrieve its action', () => {
    const action: Action = [1, 2, 3];
    const word = 'test';

    dictionary.addWord(word, action);

    expect(dictionary.getAction(word)).toBe(action);
  });

  it('should return null for non-existing word', () => {
    const word = 'nonexisting';

    expect(dictionary.getAction(word)).toBeNull();
  });

  it('should divide two integers correctly', () => {
    const stack = new Stack();
    stack.push(10);
    stack.push(3);

    dictionary['divideInt'](stack);

    expect(stack.pop()).toBe(3);
  });

  it('should throw an error when dividing by zero', () => {
    const stack = new Stack();
    stack.push(10);
    stack.push(0);

    expect(() => {
      dictionary['divideInt'](stack);
    }).toThrowError('Divide by zero');
  });
});
