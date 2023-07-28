# North ts, the Forth from the North, in TypeScript

Web interface to a fully functional forth interpretter and runtime memory display.

The North "forth machine" (found in /TypeScript/) is separated from the React view (found in the [project root](../README.md)).
The machine is implemented in TypeScript. The view is implemented in Typescript, React, Vite, Tailwind CSS.

## Backlog

- Type implied by address
  - For example
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
- More data structures as forth primitives
  - Convert between WASM 32-bit types and North i16 addresses.
  - i8, i16, LEB128, UTF-8, bigInt
  - floats?
  - Arrays are first class forth structures
  - Dictionary is composed of 'stacks'
- Core (native) to have colon word equivilence
  - Minimum core word primitives
  - Test that core and colon words behave exactly the same
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

