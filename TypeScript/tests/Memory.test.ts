import Data from '../north/Data';
import Memory from '../north/Memory';

describe('Memory', () => {
  let memory: Memory;

  beforeEach(() => {
    memory = new Memory(10);
  });

  test('read and write values', () => {
    memory.write(new Data(42), 0);
    memory.write(new Data(142), 7);
    memory.write(new Data(19));

    expect(memory.read(0).is_integer).toBe(true);
    expect(memory.read(0).value).toBe(42);

    expect(memory.read(6)).toBe(0); // TODO NOTE where there is not Data there is an int 0

    expect(memory.read(7).is_integer).toBe(true);
    expect(memory.read(7).value).toBe(142);

    expect(memory.read(8).is_fn_core).toBe(false);
    expect(memory.read(8).is_fn_colon_array).toBe(false);
    expect(memory.read(8).is_fn_condition).toBe(false);
    expect(memory.read(8).is_fn_immediate).toBe(false);
    expect(memory.read(8).is_integer).toBe(true);
    expect(memory.read(8).value).toBe(19);
  });

});
