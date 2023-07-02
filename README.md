# North, the Forth from Norway

North is a forth implementation in Python, TypeScript,
and perhaps additional languages such as WAT
(WebAssembly Text) and/or Zig.

## Data structures

Dictionary is a hash map (Object {}) of words pointing to a
LIFO collision list of definitions.

Definitions are int pointers to Memory.

Memory is an array (Python list []) of int, str, callable/function,
or array/list (this may be converted to a lower-level data structure,
particularly if/when implemented in WebAssembly).

A forth word definition (function) may be just an int
(a mutable constant, what? well for example the word "4" can be defined
as 5), or a callable (Python), function (Javascript), or list/array.
A list/array is a "user defined word" whose elements are all int memory
addresses (to int, primitive function, or another user-defined list of
addresses).

Strings. Not yet implemented, but all strings will be assumed UTF-8,
and will be accessed from memory much like defined ints
(in much the same way as strings are passed to functions in
WebAssembly, pointers to an array in memory).

## Implemented

 - Compilation between words ":" and ";" implemented as primitive forth words.
 - MOD primitive is defined such as the -13 12 MOD == -1 12 MOD == 11 12 MOD == 11
 - nested IF/ELSE/THEN blocks.
 - 53 unit tests, paralleled in two languages (Python and Typescript)

## TODO
 - Type, over- and underflow violations are strictly enforced through assertions, but not gracefully in either interactive nor batch modes.
 - Defined words and pop/pushed int implemented, but not VARIABLE.
 - LOOP, DO are not implemented
 - Implement minimum primitive words, separate additional forth in forth from optimized functions (will accelerate implementation in additional lagnuages)
 - Various front-ends (curently stable CLI, unstable React)
 - Unit tests in Forth itself
 - Consider scoped/call-stack variables (in iterations of loops and/or recursion)
 - Optimize data structures
   - I cannot see why the word-definition list should keep more than one or two definitions. Consider leaky LIFO bucket.
   - It should be possible to scan whether addresses are unreachable (fromearlier word definitions that are uncallable), and thus garbage collected.
   - INLINE compilation (very easy: flatten memory lists, rather than reference another definition in memory)
   - Consider multiple memories or different memory areas. For example, perhaps 00xx for int, 01xx for strings, 10xx for lists (user-defined word definitions), 11xx for optimized primitive definitions.


## North 

I intend to write a reference standard North by implementing
the same concepts, words, structures in several languages and environments.
Validation only requires that the same FORTH tests pass.
Though the data structures and implementations should rhyme.
We might as well optimize for each given target language and environment.
I would like North to run optimally in raw vanilla WASM,
which will then likely influence
all other implementations (in high-level languages and virtual machines).

## Run the Python implementation from shell

Tested in Ubuntu Bash and Mac Zsh.
Assumes python3 is installed (and so named, try `which python3`).
$PROJECT is a location (for example /Users/anatta/Code/).
Added to ~/.zshrc :

```
if [[ -d "${PATH_TO_NORTH_PROJECT}/Python" ]]; then
    export PYTHONPATH="$PYTHONPATH:${PATH_TO_NORTH_PROJECT}/Python"
fi
alias north='/opt/homebrew/bin/python3 -m north.shell'
```

Assuming python and PROJECT exist with proper paths, then the following interactive shell should work:

```
$ north
Welcome to North shell, the Forth from the North! (type 'quit' to quit)
1 2 +
PS
3
quit
```

And for non-interactively:

```
$ echo "1 2 + " | north 10 +
13
```


### Run all tests (by example)

We can run the same sh script (`sh run.sh tests`)
to run all North Python tests, thusly:

```
$ sh run.sh tests
Running all tests in tests/
..............................................
----------------------------------------------------------------------
Ran 46 tests in 0.002s

OK
```

### Stream stdin and/or arguments

`echo 1 2 + | python3 -m north.shell 3 + 4 + | sed s:0:5: | python3 -m north.shell "4 *"`

Or perhaps more elegant with an alias or executable:

```
$ alias north='python3 -m north.shell'
$ echo 1 2 + | north 3 + 4 + | sed s:0:5: | north "4 *"
60
```

# License

Forth has been used by NASA on critical missions.
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

