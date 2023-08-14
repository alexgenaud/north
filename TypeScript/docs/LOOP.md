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

The DO expects a LIMIT and INDEX on the stack.
Forth `5 0 DO` is similar to `for (int I=0; I<5; I++)` in C.
LIMIT and INDEX are popped and pushed onto the control stack
so that they retain the same sequence order.
This way, we can pop and increment INDEX in the `LOOP`
function and only peek at the unchanging LIMIT on the control stack.
We loop back as long as INDEX is less than LIMIT.
When INDEX >= LIMIT, both are removed from the control stack
and program continues after the loop.

## Actual result (2023 Aug)

User input definition:

`: XX 2 0 DO 5 3 DO 8 6 DO I J K LOOP LOOP LOOP ;`

Compiled definition in memory:

```
      address (hex)  3A 3B 3C 3D 3E 3F 40 41 42     adr (hex)
        value (hex)  2  0  5  3  8  6 -1A-10 -6     val (hex)
reference (decimal)  2  0  5  3  8  6 -26-16 -6     ref (dec)

43 44 45 46 47 48 49 4A 4B 4C 4D 4E 4F 50 51 52 53 54 55 56 adr (hex)
XX:19 3A    3B    14    3C    3D    14    3E    3F    14    val (hex)
functn 2    0     DO    5     3     DO    8     6     DO    ref (dec)

57 58 59 5A 5B 5C 5D 5E 5F 60 61 62 63 64 65 66 67 68 69 6A adr (hex)
11    12    13    42    16    41    16    40    16    0     val (hex)
I     J     K     -6    LOOP -16    LOOP -26    LOOP  END   ref (dec)
```

Diagram of back looping:

```
          _      _      _     __      ___      ___
XX 2 0 DO 5 3 DO 8 6 DO I J K -6 LOOP -16 LOOP -26 LOOP END
          ^      ^      ^      |       |        |
          |      |      +------+       |        |
          |      +---------------------+        |
          +-------------------------------------+
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
