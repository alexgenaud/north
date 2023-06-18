# North, the Forth from Norway

North is a forth implementation in Python.
Does not currently support indirect threading.
It's probably simplest to understand now,
without virtual memory space and virtual memory pointers.

I intend to write a reference standard North by converting
to several languages and environments. Validation only requires
that the same FORTH tests pass.
The primitive implementation should not matter.
We might as well optimize for each given target language and environment.
I would like North to run optimally in raw vanilla WASM,
which will then likely influence
all other implementations (in high-level languages and virtual machines).

## Prerequisites

I've only run this from Ubuntu bash (good luck elsewhere).
Assumes python3 is installed (and so named, try `which python3`)

## Run the forth from the North shell

Example shell from start (`sh run.sh`)
to reverse polish addition (`1 2 +`)
to finish (`quit`):

```
$ sh run.sh
Welcome to North shell, the Forth from the North! (type 'quit' to quit)
1 2 +
Stack: [3]
quit
```

## Run all tests (by example)

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

## License

For all the legal types out there,
consider this MIT or BSD0 or OpenBSD ISC licensed.
I'd appreciate attribution, accept no liability, offer no warranty,
otherwise do whatever you want with North at your own risk.

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

