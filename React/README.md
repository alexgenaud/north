# North Web

## North, forth from the North, web interface

Web interface to a fully functional forth interpretter and runtime memory display.

Implemented with Typescript, React, Vite, Tailwind CSS, backed by [North TS](../TypeScript/README.md).

## Version history, future

- 0.1.0 (latest)
  - Web interface, accepts user input, displays forth stack and memory
- 0.1.1 (develpment)
  - Display memory updates in real time

## Backlog

- Explicit Byte class separate from Metadata
  - Emulate low level i8 in high level TypeScript
  - Type implied by address
    - For exmaple
    - 20-2F: Core (native) functions
    - 30-38: Core immediate
    - 39-3F: Core conditional
    - 40-5F: Colon word pointers to array of i16 addresses
    - globals such flag meanings, pointers to dictionaries, etc
- Strings
  - UTF-8 implied
- LOOP, several loop types
  - ANS compliant version
  - Optimized FOR, WHILE, DO
- Data structures as forth primitives
  - Addresses probably i16 (though WASM is 32 bit)
  - i8, i16, LEB128, UTF-8
  - floats?
  - Arrays are first class forth structures
  - Dictionary is composed of 'stacks'
  - Type and flags implied by address range
  - Type/address lookup address range (requires further analysis)
- Core (native) to have colon word equivilence
  - Minimum core word primitives
  - Else core words are optional optimizations
  - Test that core and colon words behave exactly the same
    - Could imagine optimizations may require fewer memory writes
    - Input and output must be the same however
  - Can decide to include or eliminate optional core/colon words
- Fork thread
  - Multiple dictionaries and memory spaces
  - Child thread can access parent static memory space
  - Input stacks and output stacks
  - Distinct operation stack and control stack
  - Isolate new word dictionary and isolate volatile memory space
  - Atomic execution (transation)
    - Several word atomic write (push)
    - Same several words atomic read (pop)
- Swarm
  - Multiple forths in same or separte memory spaces
  - Input output streams via Redis, Kafka, etc
- ANS / Moore standard words, behavior
  - Use standard words if replicating classic behavior
  - Use alternative words otherwise
  - For example, CONST seems to work exactly like ANS CONSTANT
  - ANS VARIABLE does not set value, so VAR or LET might be a new word
- Formalize control stack(s)
  - Currently one-byte push/pop/peek for EXECUTE, COMPILE, IGNORE, BLOCK
  - LOOP might expect at least two pushes to the control stack
  - All "stack calls" have standard number of values?
  - Or can IF/ELSE/THEN have one, LOOP have two, etc?



  I imagine core dictionary, memory separate from 
    




