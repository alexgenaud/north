# North, the Forth from Norway

North is a Forth implementation in
[TypeScript](TypeScript/README.md),
[Python](Python/README.md),
and soon additional languages
such as WAT (WebAssembly Text) and/or Zig.

[![screenshot of React memory](https://github.com/alexgenaud/north/blob/master/North-rx.png "Screenshot")](https://alexgenaud.github.io/north/)

## Development modules:

- The front-end (Vite, React, Tailwind) app is maintained in the root of this git repository.
  - [live demo](https://alexgenaud.github.io/north/) user input and runtime memory graphic display.
- Local back-end (TypeScript) Machine model used by the TypeScript front-end.
- Independent Python implementation
  - Development of Python has fallen behind the TypeScript version (summer 2023).
  - Yet makes a convenient command line programmable calculator.

Limited and scattered [TypeScript Machine implementation documentation](TypeScript/docs/README.md).

## Data structures

Memory is represented as a byte array,
16-bit addresses pointing to 8-bit locations.

Dictionary is a hash map (Object {}) of words
pointing to a LIFO collision list of definitions.
The Dictionary will be, but not yet, displayed
within volatile runtime memory.

All Forth function word definitions
are 16-bit pointers to Memory.

In contrast to traditional Forth, North Data are strongly typed.
North intends to support a sub- and super-set
and best of JS, WASM, Python datatypes, such as
i8, i16, f64, as well as bigInt, UTF-8 strings,
native functions, and forth words (compiled as i16 addresses).

## Backlog

- Implement loops, BEGIN..UTIL, DO..LOOP, with I, J, K
  - anonymous "pre"-compilation for INTERPRET parser
- Implement BASE
  - decimal, hex, binary user input and numeric output as per ANS standard.
  - Toggle BASE in graphic display of memory addresses and values.
- Display dictionary in memory
  - Remove colon definition array header
  - Name, flags, header, pointer on dictionary entry
  - Pointer to earliest empty executable memory address
  - Pointer to earliest empty dictionary memory address
  - ANS PAD and HERE, variables
- Dragable input/control component
  - React, Tailwind
- Graceful error handling
  - ANS ABORT
  - Clear all stacks and user input buffer.
  - Consider Checkpoints, FORGET, memory cleanup.
  - Over- and underflow, type violations, divide by zero, must not halt the runtime
- Display stacks, buffers, output in memory
  - Generic >X, <X, X<, X> notation
    - Data, param, operation, control, return stacks pop/push pop from left (read fwd)
  - User input
    - Circular stack, write to right end, read from left (somewhat backwards)
    - Input to a temporary modifiable stack in memory.
  - Input to be interpretted (same or copy?)
- Display output
  - ANS puts "ok" after input is executed
  - ANS out "." after input line
  - ANS data stack is hidden.
  - Calculator data stack is visible (fx top four stack peek)
- Memory editor
  - 'vi-like' modes
    - 'i' insert, 'esc' normal movement
  - edit memory address values as if a text document
    - Forth words, JS style
    - example LINE OF WORDS 123 "ex str" 0 8
- Bring Python up to the TypeScript level
- Separate memory areas
  - Core vs native (WASM func table) vs user defined words
  - Ranges of byte sizes
  - fx 00-2F may be one byte, 30-9F may be i16[]
  - A range for variable length stack values
  - A huge range for the dictionary
  - Data type/size by memory address prefix.
- More forthy words
  - What MUST be native, such as memory addresses?
  - Can we implement most of North in Forth?
  - Unit tests in Forth itself
- Standardization
  - Do more of the Forth-way
  - Support more ANS words
- Optimize dictionary
- Consider leaky LIFO definition bucket.
- Scan unreachable addresses, primitive garbage collection.
- INLINE vs REFERENCE compilation (easy to implement, hard to determine at runtime)
- Implement in Zig and WAT/WASM

# Development

## Helpful TypeScript yarn commands

    yarn test
    yarn tsc
    yarn prettier "./**/*.{css,cjs,html,js,json,md,ts,tsx,yml}" --write;yarn prettier . --check
    yarn lint
    yarn outdated && yarn upgrade && yarn install
    yarn upgrade-interactive --latest

## Helpful React (root) commands

    yarn tailwindcss -i src/input.css -o dist/output.css [ --watch ]
    yarn run dev
    yarn vite build && yarn vite preview

## Run the Python implementation from shell

```
$ alias north='python3 -m north.shell'

$ echo 1 2 + | north 3 + 4 + | sed s:0:5: | north "4 *"
60
```

See [Python North][Python/README.md] for more details

# License

Forth has been used by NASA and ESA on critical missions.
North is currently not ready for space missions.

For all the legal types out there,
consider this MIT (or BSD0 or OpenBSD ISC) licensed.
I'd appreciate attribution. I accept no liability and offer no warranty.
Otherwise do whatever you want with North at your own risk.

```
(c) 2023 Alexander E Genaud

Permission is granted hereby,
to copy, share, use, modify,
   for purposes any,
   for free or for money,
provided these rhymes catch eye.

This work "as is" I provide,
no warranty express or implied,
   for, no purpose fit,
   'tis unmerchantable shit.
Liability for damages denied.
```
