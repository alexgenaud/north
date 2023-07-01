import Memory from '../north/Memory';

describe('Memory', () => {
  let memory: Memory;

  beforeEach(() => {
    memory = new Memory(10);
  });

  test('read and write values', () => {
    memory.write(42, 0);
    memory.write(142, 7);
    memory.write(19);
    expect(memory.read(0)).toBe(42);
    expect(memory.read(6)).toBe(0);
    expect(memory.read(7)).toBe(142);
    expect(memory.read(8)).toBe(19);
  });

});
