# North ts, the Forth from the North, in TypeScript

North module representing the Machine 'back-end' (while probably running locally in a browser).
The Machine is no concerned with the view.
The Machine accepts an input stream and updates its own model, consisting primarily of the Machine Memory,
as well as other data structures
(that may not yet be implemented in the Memory array, but should/will be in future versions).

The North "forth machine" (found in /TypeScript/)
is separated from the React view (found in the [project root](../README.md)).
The machine is implemented in "pure" TypeScript.
The view is implemented in Typescript, React, Vite, Tailwind CSS.

[Parent North project](../README.md) - Including TypeScript front-end, this back-end, and outdated Python implementation.
Limited and scattered [TypeScript Machine implementation documentation](TypeScript/docs/README.md).

## Backlog

- Loops
  - DO..LOOP
  - BEGIN..UNTIL
  - I, J, K
  - ANS compliant version
  - Optimised FOR, WHILE, DO
- Type implied by address range
  - For example
  - 20-2F: Core (native) functions
  - 30-38: Core immediate
  - 39-3F: Core conditional
  - 40-5F: Colon word pointers to array of i16 addresses
  - globals such flag meanings, pointers to dictionaries, etc
- Consider separating native from colon words address spaces
  - To optimally support WASM function tables
  - Protect critical code and variables
- Consider lowest memory
  - map to primitive integers such as address 0 to value 0, 1 to 1, 2 to 2, ... 10, ... 16?
  - to protect immutable or unsafe core/native variables
- Consider aggressive compilation
  - Loops and conditionals always (anonymously) compiled
  - 256 native words
    - 8 bit references
    - map to 32 bit WASM function table
  - Several compilation parsers
    - 8 bit addresses only or
    - include strings and/or float or
    - Mixed length
    - LIT, call stack, ...
    - May require strictly defined parser/return call stack
- Strings
  - UTF-8 implied
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
