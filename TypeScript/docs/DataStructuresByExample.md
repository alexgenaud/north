[ [North project](../../README.md) > [TS Machine](../README.md) > [Documentation](README.md) ]

# Forth data structures and variables

Simple example of primitive functions,
colon words (user defined functions),
variables, constants, and the stack,
dictionary, and memory.

## Concepts

- The stack is a LIFO stack of data.
  - for example "1 2 3 4" or [1, 2, 3, 4]
  - pushing an operation, such as "+"
    - immediately results in "1 2 3 4 +"
    - The "+" pops 4 then 3, and pushes the sum 7
    - for the resultant stack "1 2 7"
- A word is a dictionary entry.
- A single dictionary word definition is an integer memory address.
- We are typically interested in the last of potentially many definitions of a given word.
  - for example { "SUB" : [ 2, 5, 9] }
  - "SUB" is a dictionary word.
  - This word has three memory address definitions.
  - But we are often most interested only in the last address, in this case 9
- The dictionary definition points to a location of memory with one of three types.
- The (current) memory location types are int, callable, list.
  - an int will be pushed to the stack.
  - a callable will be executed (usually pops from and pushes to the stack)
  - a list is a sequence of memory address, each pointing to int, callable, or list.

## Example

```
dictionary: {
    "@"   : [...., 3], // 3 is a memory address
    "+"   : [1, 2, 4], // 4 is the final address
    "SUM" : [...., 5], // 5    "     "     "
    "KB"  : [...., 6], // 6    "     "     "
    "INC" : [...., 8], // 8    "     "     "
    "YEAR": [..., 10], // 10   "     "     "
    "!"   : [..., 11], // 11   "     "     "
    "VAR" : [..., 12], // 12 is a memory address
}
```

```
memory: [
0 : ....
    ....
3 : function:push(valueAt(pop)), // definition of "@"
4 : function:push(pop + pop), // definition of "+"
5 : list_of_addresses[4], // "SUM" points to function above
6 : int 1024,
7 : int    1,
8 : list_of_addresses[7, 5]
9 : int 1999,
10: int    9,
11: function:dict[pop]->pop, // definition of "!"
]
```

- Suppose input: "5 INC"

  - "5" is looked up in the dictionary,
    - not found,
    - int 5 is pushed to stack.
  - "INC" is looked up in the dictionary,
    - found last definition at address 8,
    - memory location 8 is a list
    - iterate over list of addresses [7, 5],
      - address 7 points to int value 1
      - push 1 to stack
      - address 5 points to a list
      - iterate over list of address [4]
        - address 4 points the "+" function
        - execute the function
        - our stack has values "5 1"
        - the function pops both
        - and pushes 6 to stack

- "KB" is meant to be a constant.

  - when looked up in the dictionary,
  - found int 1024 at address 6,
  - push 1024 to stack.

- "YEAR" is meant to be a variable.

  - when looked up in the dictionary,
  - found int 9 at address 10,
  - push 9 to stack.

- Suppose input: "@"

  - We already pushed the value of "YEAR" to the stack,
  - The value is 9, the address of the variable value,
  - "@" is looked up in the dictionary,
  - its last definition points to memory address 3,
  - memory at address 3 contains a function,
  - the function pops the value 9 from the stack,
  - the function looks up the value at address 9,
  - and pushes 1999 to the stack.

- Suppose input: "2023 YEAR !"

  - "2023" is not found in the dictionary,
    - int 2023 is pushed to the stack.
  - "YEAR" is in the dictionary,
    - the final definition points to address 10,
    - the value at memory location 10 is 9
    - int 9 is pushed to the stack,
  - "!" is in the dictionary,
    - the final definition points to address 11,
    - the value at memory location 11 is a function,
    - the function pops two values off the stack
    - set the value 2023 at location 9.

- The stack is empty and a section of memory looks as follows:

  - [ ..., 9 : int 2023, 10: int 9, ... ]

- Suppose input: "YEAR @ INC YEAR !"

  - Only the value at adress 9 will be incremented,
    - [ ..., 9 : int 2024, ... ]

- We can initialize "VAR MONTH" without setting a value,

  - The value at a new address location will be 0.

- Suppose input: "VAR DAY 30 DAY !"
  - We expect a new dictionary entry:
    - "DAY" : [..., 13]
  - We can expect two new memory values:
    - [ ..., 12 : int 30, 13 : int 12, ...]
  - The address sequences may differ in practice.
