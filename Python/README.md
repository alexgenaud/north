# North Py, the Forth from Norway, in Python

North is a forth implementation in many languages.
This sub-project is written in Python.

[Parent North project](../README.md) - Including TypeScript front- and back-end, and this Python implementation.

## Prerequisites

I've only run this from Ubuntu bash (good luck elsewhere).
Assumes python3 is installed (and so named, try `which python3`)

## Run the forth from the North shell

Example shell from start (`sh run.sh`)
to reverse polish addition (`1 2 +`)
to finish (`quit`):

```
$ sh run.sh
Welcome to North shell,
the Forth from the North!
(type 'quit' to quit)
1 2 +
PS
3
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

## Stream stdin and/or arguments

`echo 1 2 + | python3 -m north.shell 3 + 4 + | sed s:0:5: | python3 -m north.shell "4 *"`

Or perhaps more elegant with an alias or executable:

```
$ alias north='python3 -m north.shell'

$ echo 1 2 + | north 3 + 4 + | sed s:0:5: | north "4 *"
60
```

## Consider adding to .bashrc or .zshrc

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

## License

North is not ready for critical NASA space missions.

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
