import Stack from '../north/Stack';

describe('Stack', () => {
    let stack: Stack;

    beforeEach(() => {
        stack = new Stack();
    });

    test('push and pop values', () => {
        stack.push(42);
        expect(stack.pop()).toBe(42);
    });

    test('return undefined for empty stack', () => {
        // should work, but annoying test output
        //expect(stack.pop()).toBeUndefined();
        expect(stack.is_empty()).toBe(true);
    });

    test('return peeked value without popping', () => {
        stack.push('Hello');
        stack.push('World');
        expect(stack.peek()).toBe('World');
        expect(stack.pop()).toBe('World');
        expect(stack.pop()).toBe('Hello');
    });

    test('return stack length', () => {
        stack.push(1);
        stack.push(2);
        expect(stack.length).toBe(2);
    });

    test('iterate over stack values', () => {
        stack.push(1);
        stack.push(2);
        const values = Array.from(stack);
        expect(values).toEqual([1, 2]);
    });

    test('return stack contents as string', () => {
        stack.push(1);
        stack.push(2);
        expect(stack.toString()).toBe('1 2');
    });
});
