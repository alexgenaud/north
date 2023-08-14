[ [North project](../../README.md) > [TS Machine](../README.md) > [Documentation](README.md) ]

# BEGIN ... UNTIL

BEGIN...UNTIL must be compiled (for now).
It will loop until the word `UNTIL` reads
a non-zero value on the stack.

```
    : TOFOUR BEGIN DUP 1 + DUP 4 >= UNTIL ;
```

The example above will push `0 1 2 3 4` onto
the stack when we run `0 TOFOUR`.
Assuming our word definition starts
at address 50 and where `&` means "the i16 address of",
the code for the compiled word `TOFOUR` will look thusly:

```
50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 mem addresses
&DUP  &1    &+    &DUP  &4    &>=   &-12  &J=0  &0    mem values
```

Note that the numbers 0, 1, 4, and -12 will
be defined somewhere in memory,
most likely before address 50.
Suppose the numbers are defined at addresses
40, 41, 42, and 43 (i8 respectively)
and the core words DUP, +, >=, J=0 are
defined at addresses 20, 22, 24, 26
(i16 pointers to native function table).
We would expect the absolute values thusly:

```
50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 memory addresses
20    41    22    20    42    24    43    26    40    pointer (adr of values)
```

Note that `>=` was chosen, rather than the more obvious `=`,
to protect against an infinite loop when
the number on the stack is greater than 4.

# DO ... LOOP

DO..LOOP also must be compiled (for now).
It may be helpful to think of `M I DO X LOOP` in Forth
as equivilent to `for (int i=I; i < M; i++) X;` in C.

```
    : INCREMENT DO DUP 1 + LOOP ;
```

The example above expects three values on the stack.
Suppose we wanted to generate `0 1 2 3 4` on
the stack as in the BEGIN..UNTIL example,
we could run `0 4 0 INCREMENT`.

Suppose our definition begins at address 68,
the compiled `INCREMENT` definition
might look like ("address of" `&` removed):

```
68 69   70 71   72 73   74 75   76 77
>C      >C      DUP     1       +

78 79   80 81   82 83   84 85   86 87
C>      DUP     C>      1       +

88 89   90 91   92 93   94 95   96 97
DUP     ROT     >=      -26      J=0

98 99   100..1  102..3
DROP    DROP    0
```

The top two values from 'the stack' `S` will be
pushed to stack `C` and 'hidden' in the body of the loop.
If the top two stack `S` values
are `4 0` at the beginning of the DO..LOOP
then `>C >C` will reverse their order on the control stack `C`.
Popping the same values from `C` to `S` at the
end of the DO..LOOP reverses them again.
Except we complicate things with
pop, duplicate, pop, increment, duplicate,
rotate, and compare greater-than-or-equal.
Step by step at the `DO` begining S=[.. 4 0] and C=[..].
Then pop and push twice S=[..] to C=[.. 0 4].
At the end of the `LOOP`: C=[.. 0] push to S=[.. 4].
Duplicate S=[.. 4 4 ].
Pop from C=[..] onto S=[.. 4 4 0].
Increment S=[.. 4 4 1].
Duplicate S=[.. 4 4 1 1].
Rotate S=[.. 4 1 1 4].
Compare greater-than-or-equal `>=`
(1 is not >= 4, false=0), S=[.. 4 1 0].
Consume 0 and relative address -26, .. since 0
then jump (`J=0`) to back -26 addresses, S=[.. 4 1].
Note that the top two values on the stack are almost
as when we first began the DO..LOOP except 1 is incremented from 0.
We'll repeat several times returning back to `DO`
until S=[.. 4 4] when `DROP DROP` clears the stack `S`.

Suppose the same pointers from BEGIN..UNTIL and additionally
the number -26 is defined at address 44.
`>C` (aka `C` or `S>C`) meaning "pop from 'the stack' `S`
and push onto stack C") is defined at address 28.
`C>` (aka `C>S`, meaning "pop from stack `C`
and push onto 'the stack' S") is defined at address 30.
Suppose `>=` and `ROT` and `DROP` are
defined at addresses 32 and 34 and 36, respectively.
The absolute address values of the
compiled word definition might be as follows:

```
28 28 20 41 22 30 20 30 41 22 20 34 32 44 26 36 36 40
```

However, most likley an optimized native version of `DO` will be referenced,
represented by a single i16 address.
Even more likely,
the dozen compiled words at the end of the loop will be replaced
with a single address pointing to an optimized native `LOOP` function.
It will still require the relative jump address,
but only -8 rather than -26.

```
68 69   70 71   72 73   74 75   76 77   78 79   80 81
DO      DUP     1       +       -8      LOOP    0
```

# Indices I J K

Reference: https://www.forth.com/starting-forth/6-forth-do-loops/

Forth index functions `I`, `J`, `K` are similar to
the index values `for (k) for (j) for (i)` in
C (pseudo-code) but the analogy must not be taken too far.
The forth `I` is the index value of the
inner loop from the current perspective.
Consider the following snippet:

```
    3 0 DO I . 8 5 DO I . LOOP LOOP
```

The first `I` in the outer loop will represent values 0, 1, 2.
Do not be surprised that the second `I` in
the inner loop will represent values 5, 6, 7.
Neither `I` function knows whether it is
called from within an inner, outer, or any other loop.

Let us make a single subtle change in the inner loop.
Let us replace the inner `I` with `J` thusly:

```
    3 0 DO I . 8 5 DO J . LOOP LOOP
```

Now, the outer `I` will represent values 0, 1, 2, as earlier.
The inner `J` will also represent values 0, 1, 2 from the outer loop.
Thus, it may be best to remember that `I` is the index of 'this' loop
and `J` is the index of the loop surrounding 'this' loop and
`K` is the index of the loop around the loop surrounding 'this' loop.
It's the programmer's responsibility to be certain the appropriate
inner or outer loops exist (from the current perspective)
when referencing indexes `I` (this loop), `J` (outer loop from this),
or index `K` (outer outer loop from current position).

How does this work from low level memory?

Recall the formula `LIMIT INDEX DO ... LOOP` pushes the numbers
LIMIT and INDEX in reverse order onto C=[INDEX LIMIT].
Consider:

```
    3 0 DO ... 6 3 DO ... 9 6 DO ... LOOP LOOP LOOP
```

While in the outer-most loop
(and not inside another loop), C=[AI 3].
While in the middle loop
(and not in the inner-most loop), C=[AI 3 BI 6].
While in the inner-most loop, C=[AI 3 BI 6 CI 9].

`I` will always push a copy of the
second element from the top of stack `C`.
`I` will be CI, BI, or AI depending
on where we are in the looping,
what loops actually exist at this time,
and thus what loop indices and
loop limits exist on the `C` stack.

`J` will always push a copy of the
fourth element from the top of stack `C`.
An error will be thrown if there is no fourth element,
if there is no outer loop.
Unexpected behavior (aka a bug) will occur if there are
sufficient elements on stack `C`
but no corresponding outer loop.

Predictably `K` will always push a copy of
the sixth element from the top of stack `C`.
As always, it's the programmer's responsibility to ensure
that an outer outer loop exists when `K` is called.

# Must be compiled ... for now

What does this "for now" mean?

Well, because loops jump back to an earlier instruction,
we need to parse the loop body first and
record a defined instruction to loop back to.

IF ELSE THEN has a similar problem,
where we jump over compiled code (if-true or else-false blocks).
However, we can read interpretted instructions
without executing them in a single pass.
It's the repeated looping that adds extra complexity.

_Open Firmware_ apparently temporarily compiles
an anonymous loop definition and frees the
definition memory after exiting the loop.
