# North, the Forth from Norway

North is a Forth implementation in
[Python](Python/README.md),
[TypeScript](TypeScript/README.md),
and soon additional languages
such as WAT (WebAssembly Text) and/or Zig.

![screenshot of React memory](https://github.com/alexgenaud/north/blob/master/North-rx.png "Screenshot")

A React app is maintained in the root
of this git repository. A
[live demo](https://alexgenaud.github.io/north/)
graphically displays emulated
Forth runtime memory.

The Python implementation makes a convenient
command line tool, programmable calculator.

## Data structures

Memory is represented as a byte array,
16-bit addresses pointing to 8-bit locations.

Dictionary is a hash map (Object {}) of words
pointing to a LIFO collision list of definitions.
The Dictionary will be, but not yet, displayed
within volatile runtime memory.

All Forth function word definitions
are 16-bit pointers to Memory.

Data is typed in North (at this time).
This contrasts traditional
Forth, which is most often losely typed
(or not typed at all). North intends to support
a subset and best of JS, WASM, Python datatypes,
such as i8, i16, f64, bigInt, UTF-8 strings,
native functions, and
forth words (compiled as i16 addresses).

## TODO

- Graceful error handling (over- and underflow, type violations, divide by zero) must not halt the runtime
- LOOP, DO are not implemented
- Support more ANS words
- Do more of the Forth-way
- Bring Python up to the TypeScript level
- Unit tests in Forth itself
- Optimize dictionary
- Separate memory areas (core vs user defined words)
- Consider leaky LIFO definition bucket.
- Scan unreachable addresses, primitive garbage collection.
- INLINE vs REFERENCE compilation (easy)
- Data type/size by memory address prefix.

## Intensions

Harder to write my forth, but probably will be very easy to write a third forth.

Portabile to different languages or environments.

I would like North to run optimally in raw vanilla WASM,
which will then likely back-influence all other implementations.

# Development

## Helpful /TypeScript/ commands

    yarn test
    yarn tsc

## Helpful React (root) commands

    yarn tailwindcss -i src/input.css -o dist/output.css --watch
    yarn run dev

Vite Static Deploy
https://vitejs.dev/guide/static-deploy.html

    yarn vite build
    yarn vite preview

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
