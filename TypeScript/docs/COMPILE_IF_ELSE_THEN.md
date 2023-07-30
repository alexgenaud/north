# Compilation of conditional words

How to compile `: NEW_WORD IF ELSE THEN ;`

In this article, we will discuss the reading and interpretation of each word,
what happens during execution of each word, how memory will be modified, word by word,
and the final compilation and linking.

## A word about words

We will use the following input command as an example.

```
    : XNAME YOG IF FOO ELSE BAR THEN BAZ ;
```

Seasoned Forth (or North) programmers who can skim and at
least vaguely understand the example, should skip this section.

```
    -                                    _
    : XNAME YOG IF FOO ELSE BAR THEN BAZ ;
    ^                                    ^
    |                                    |
 (: starts the compilation)              |
                                         |
                      (; ends the compilation)
```

We will present the compilation (`:` ... `;`) of conditionals (`IF`, `ELSE`, `THEN`).
These are the five most consequential words in this example.

```
                --     ----     ----
    : XNAME YOG IF FOO ELSE BAR THEN BAZ ;
                ^      ^        ^
                |      |        |
               (conditional words)
```

The new compiled word could have nearly any name,
provided it includes only printable characters.
We will arbitrarily name
our new compiled word `XNAME`.

```
      -----
    : XNAME YOG IF FOO ELSE BAR THEN BAZ ;
      ^
      |
  (arbitrary name for our new compiled word)
```

The full input command includes nonsensical
words `YOG`, `FOO`, `BAR`, `BAZ` for the illusion of realism
while not distracting our focus from compilation and conditionals.
We will pretend that `YOG`, `FOO`, `BAR`, `BAZ` have
pre-exiting meaning and that they point to functions or numbers.

```
            ---    ---      ---      ---
    : XNAME YOG IF FOO ELSE BAR THEN BAZ ;
            ^      ^        ^        ^
            |      |        |        |
    (inconsequential words in the dictionary)
```

There may be hints of `zzz` in some examples below.
These characters mean nothing of consequence.
Or rather `zzz` represents unknown undefined garbage that may be in memory.
`zzz` may be temporary data left over from earlier processes, unallocated,
never initialized, anything unpredictable, or no longer unreferenced.
We can assume there is a huge qualtity of `zzz` not worth further discussion.

```
    ---                                        ---
    zzz : XNAME YOG IF FOO ELSE BAR THEN BAZ ; zzz
    ^                                          ^
    |                                          |
 (zzz unknown garbage of little or no consequence)
```

## Points of input

The contents of the input buffer could come from any source.
For simplicity, we will assume the input originates from
a keyboard, human ape, and/or cat.

Keyboard input will be trimmed and cleaned
so that it consists of printable text (words or numbers)
separated by exactly one space character (`0x20` or `0x00`)
and ending with two spaces.

A single input stream must be shorter than the bounds
of the circular input stack.
Input can and usually will begin
in the middle, may cycle around to the beginning,
and end where it will with two spaces.
New input will continue from and overwrite
the second of the previous double spaces,
ending again with double spaces.

```
  | 0    5  8 10  14 | (mem addresses)
  | rld!  z Hello Wo | (text values)
            ^
            |
            IP = 8
```

The real size of the input buffer is quite large.
However, we illustrate `IP` (input pointer)
above with a fictional buffer of 16 bytes.
It's too clausterphobic for the classic program, but the plain text will fit.
Notice `IP` points to byte 8 with the "H" of "Hello".
"World" is truncated at "o" at byte 15 and continues with "rld! " from byte 0.
`z` is unknown, presumably left over from an earlier command,
and is of no consequence.
The next input stream (not illustrated) would begin at byte 5.

## In the beginning

Let us begin with creation.

Let our user input the following

`: XNAME YOG IF FOO ELSE BAR THEN BAZ ;`

User input is appended to the circular input buffer at the
memory location pointed to by `IP` (input pointer).
`IP` will advance as each space-deliminated word is parsed
until `IP` points to double space.

```
    14    20    26  30 33  37   42  46   51  55 58   (mem addresses)
    zzz : XNAME YOG IF FOO ELSE BAR THEN BAZ ;  zzz  (input buffer)
        ^                                      ^
        IP = 18                                (end of input)

PARSE :: &INTERPRET   (PARSE word points to INTERPRET word input parser)
IP    :: 18           (next word `:` from input buffer)
```

Our `PARSE` variable points to the address of `INTERPRET` as it often does,
waiting for input to interpret.

As celestial wisdom and human whim would have it,
`IP` is now set at 18, the beginning of the new input.
It will take several minutes to describe below,
but in reality `IP` will quickly progress to the end of input in under a millisecond.

## `INTERPRET` `:` (compile word) from input buffer

Eventually, `INTERPRET` will come across a `:` word in the input buffer.
This is where our compilation adventure begins.
The conditional if/else logic will make for a bumpy ride.

`IP` now points to `:` (compile word at input address 18).
The `INTERPRET` parser consumes `:` and
simultaneously shifts the input buffer,
advancing `IP` to the next word.
`INTERPRET` queries the `:` word in the dictionary.
When found, `:` will be executed.
The `:` word prepares for compilation and
critically sets `PARSE` to `& :_P` (the address of the compile parser).
The `:` execution returns.

```
    14    20    26  30 33  37   42  46   51  55 58   (mem addresses)
    zzz : XNAME YOG IF FOO ELSE BAR THEN BAZ ;  zzz  (input buffer)
          ^
          IP = 20

PARSE   :: &:_P       (PARSE word points to :_P word, the compile parser)
IP      :: 20         (next word `XNAME` from input buffer)
:NAME   :: XNAME      (name of the word to be compiled)
:S      :: []         (definition stack of compiled word addresses)
:RELADR :: []         (temporary stack of indices with relative addresses)
CS      :: []         (control stack)
```

The above illustrates some variables in memory immediately after `:` returns.
`PARSE` no longer points to `INTERPRET` but rather contains the address of `:_P`.
`IP` has already advanced to the next word.
`:` ensured that the `:NAME` string is empty
and the stacks `:S` and `:RELADR` are empty.
`CS` happens to be empty in this example, but that need not have been the case.
We do not care what may have been burried at the bottom of the `CS` stack.
We will only be concerned with what will be
pushed into and popped from `CS` until complication completes.

## Parse new word name from input buffer after the new name

The `:_P` parser shifts `XNAME` from the input buffer
and advancing `IP` forward to the next word.
As the first word in the compile stream (after the compile `:` word),
`:_P` knows that `XNAME` will be the name of the new word to be compiled.
The `:NAME` variable is set to `XNAME` but not yet pushed into the dictionary.

```
    14    20    26  30 33  37   42  46   51  55 58   (mem addresses)
    zzz : XNAME YOG IF FOO ELSE BAR THEN BAZ ;  zzz  (input buffer)
                ^
                IP = 26

PARSE   :: &:_P  (PARSE word points to :_P word, the compile parser)
IP      :: 26    (next word `YOG` from input buffer)
:NAME   :: XNAME (name of the word to be compiled)
:S      :: []    (definition stack of compiled word addresses)
:RELADR :: []    (relative address stack of indices)
CS      :: []    (control stack)
```

## Reference address of first "executable" word or number

The `:_P` parser shifts `YOG` from the input buffer (at address 26).
The `:_P` parser queries `YOG` in the dictionary.
If `YOG` is found in the dictionary, its address is returned.
If `YOG` is not found in the dictionary,
then `YOG` will be coerced as a number,
its value set in memory, and its new address returned.
If `YOG` is neither a word nor number, an error is thrown.

Let us assume `YOG` is in the dictionary
(whether extant or a newly added number is of no import in this article).
Suppose the dictionary returns 112 as the two byte memory address of `YOG`.
The address 112 will be pushed to the bottom of the temporary
definition stack `:S`.

```
    14    20    26  30 33  37   42  46   51  55 58   (mem addresses)
    zzz : XNAME YOG IF FOO ELSE BAR THEN BAZ ;  zzz  (input buffer)
                    ^
                    IP = 30

IP      :: 30    (next word `YOG` from input buffer)
:S      :: [112] (definition stack of compiled word addresses)
:RELADR :: []    (relative address stack of indices)
CS      :: []    (control stack)
```

## Whether to `ELSE`, or not to `ELSE`, `THEN` is the destination

We're coming upon the `IF` word.
Let's take a moment to discuss how conditionals will be compiled.

It might be surprising that `THEN` is at the end, after `IF` and `ELSE`.
Perhaps this makes some sense from the 'Reverse Polish Notation' perspective.
If not, then let's say "that's just the way it is".

Another thing to note is the conditionals will be handled differently
depending on whether we're compiling user input or just interpretting
user input or executing compiled conditionals.
The `INTERPRET` parser will need to read every word whether in the
`IF` or `ELSE` block as it cannot yet predict
what can be ignored or where to jump ahead to.
But that's a different discussion because in this article we are compiling.

After a word has been compiled, the execution will be able to
test conditions and jump ahead skipping either the IF or ELSE block.
During the compile phase (which we are discussing),
we need to keep track of addresses we jump from and addresses we jump to.
We cannot know all of these addresses until we read them and cannot
finalize any of them before setting the word in the
dictionary and the compiled definition into executable memory.

```
  IF                FOO               ELSE     BAR THEN BAZ      RETURN

  02       04       06       08       10       12       14          (relative definition addresses)
  [2 ,                       8]                                     (rel. adr. pushed to CS)
  ??       & J=0    & FOO    ??       & JMP    & BAR    & BAZ    0  (pointers, word addresses)
```

Let's consider the diagram above.
We've skipped over the initial words and begin with `IF` to shorten the diagram.
The top line represents the user input words [ IF FOO ELSE ... ]
with generous white space in between.

The next line [02, 04, 06, 08, ...] are the relative addresses of each compiled word.
We already compiled `VOG` at address 112 in two bytes at relative address 00.
We will discuss each additional compiled word in detailed sections below.
Let it be sufficient to say now that each compiled word is a two byte address,
and the entire compiled definition will require more than a dozen bytes.

We say 'relative' because we will pressume our compiled definition begins at address 00.
Obviously every compiled definition cannot begin at memory address 0.
When we complete compilation (at word `;`),
we will look up the latest value of `MEMP`
and append the entire compiled definition from memory address `MEMP`.
Any specific absolute memory address is the sum of a relative addresses plus `MEMP`.

The line under the relative addresses of future compiled words are two entries [ 2 , 8 ]
that will be pushed to the control stack.
These relative addresses in the control stack
refer to the null departure locations to be later replaced
with relative destination addresses.
During final compilation and linking at `;`
we'll add these relative address jumps to `MEMP` to obtain the absoluate jump destination.

On the same line are addresses of words such as `& FOO` (the absolute address of `FOO`).
We've already compiled `& YOG`.
The `??` are the jump destination addresses that we do not know yet.
Finally, we will end with 0 or a return address.

Let's expand our diagram with additional spaghetti,
ASCII lines attempting to demonstrate
jumping from some `??` to some future compiled address.

```
  IF                FOO               ELSE     BAR THEN BAZ      RETURN

  02       04       06       08       10       12       14          (relative definition addresses)
  [2 ,                       8]                                     (rel. adr. pushed to CS)
  ??       & J=0    & FOO    ??       & JMP    & BAR    & BAZ    0  (pointers, word addresses)
  +-                         +-                ^        ^
  |                          |                 |        |
  +--------------------------|-----------------+        |
                             |                          |
                             +--------------------------+

J=0  ( n0 adr1 -- )  jump to adr1 (if n0 == 0)
JMP  (    adr2 -- )  jump to adr2 (always)
```

`IF` and `:IF` are indeed words in our dictionary as we'll call in the next section.
However, we will compile neither into our new definition.
Nor will we compile `ELSE` nor `THEN` in our definition.
Instead we will test 0 and conditionally jump and later compile a mandatory jump.

Presumably some prior math,
results and numbers will be on the operation data stack
before our new word is called,
or perhaps the compiled `YOG` may itself be a number
or a function that pushes a number onto the stack.
However it may be that a number arrives on the stack,
`IF` pops the value and interprets 0 as false and everything else true.

So, in the case that we pop 0,
then we want to skip the if-true-block entirely
and jump to the beginning of the else-false-block.
Otherwise, in all other cases (not 0),
we ignore the jump and preceed to the next address as normal.
However, when we get to the end of the if-true-block,
immediately before the else-false-block, then
we want to jump to the end of the else,
to the end of the entire conditional block.

In psuedo BASIC code:

```
00 (do YOG)
02 (if pop == 0 then jump to 12)
06 (do FOO)
08 (jump to 14)
12 (do BAR)
14 (do BAZ)
16 (return)
```

When we parse `IF` we push its relative address to the control stack `CS = [2]`.
Later, when we parse `ELSE` we predict the destination
six bytes into the future (12), then pop `CS` to find the departure location is `:S`.
We can now set the relative destination jump address at address 02
(conceptually replacing `??` or `IF`).
However, we must note that 10 is a relative, not absolute, address.
We'll note that fact in `RELADR` so that we can later sum `MEMP`
and 10 before injecting the entire definition into executable memory.

```
  IF              FOO             ELSE    BAR
  02      04      06      08      10      (12)
 (12)     & J=0   & FOO  (??)     & JMP   & BAR
  ^                                       --+--
  |                                         |
  +-----------------------------------------+

                  FOO             ELSE    BAR   THEN   BAZ
                  06      08      10      12           (14)
                  & FOO  (14)     & JMP   & BAR        & BAZ
                          ^                            --+--
                          |                              |
                          +------------------------------+
```

Why 'six bytes into the future'?
When we parse `ELSE` from the input we want
to first clean up the jump from A to C before preparing
the jump from B to D.

The word `ELSE` won't be compiled at all.
But there will be four bytes for the
mandatory jump (adr JMP) followed by
some destination address (the sixth address).
We do not yet care what it is after the `ELSE`,
even if there may be an empty else-false-block and the next word is `THEN`.

Having cleaned up the first conditional `JMP=0`,
we prepare for the mandatory `JMP` over the else-false-block in the same way.
We push the relative address 06 onto the control stack and
allocate the four bytes for the as-yet undefined address
and mandatory jump.

And we continue parsing.

## Compile our first conditional word `IF`

As you may recall `IP` was pointing to `IF` (at address 30) of the input buffer.
The `:_P` parser will shift `IF` and advance `IP` to the next word.

The parser looks `IF` up in the dictionary.
The definition will have an 'immediate conditional' flag that
requires execution of a specific compilation function: `:IF`.

Rather than direclty compile the address of `IF` into our new definition,
`:IF` will instead prepare for a conditional address jump.
We want to compile new two words (four bytes):
a destination address followed by the `J=0` command
(meaning 'jump to the destination address if previous number on stack equals 0').

However, we do not yet know where the destination will be
among the many input words not yet seen.
And we certainly do not know what the absolute address will be
when the fully compiled and linked definition is added to executable memory.

```
    14    20    26  30 33  37   42  46   51  55 58   (mem addresses)
    zzz : XNAME YOG IF FOO ELSE BAR THEN BAZ ;  zzz  (input buffer)
                       ^
                       IP = 33

:S      :: [112, 0, 86]   (definition stack of compiled word addresses)
CS      :: [     2    ]   (control stack refers to two byte index of null address)
:RELADR :: [     2    ]   (relative address stack flags 2 as relative)
```

For now, we push address 00 (aka null) as place-holder onto `:S`.
Then we lookup the absolute address of `J=0`.
Suppose the address is 86.
We push 86 onto `:S`.

We push the relative address 02 (the second two byte address)
onto the control stack `CS` and onto the relative address stack `:RELADR`.

While these have the same value for the same reason, the `CS` will grow and shrink
as we push and pop values, even supporting nested conditions (if inside of it).
Whereas `:RELADR` will not be popped until final compilation when
we find and convert relative addresses to absolute addresses.

## Compile second executable word or number in the true-if-block

The parser shifts `FOO` from the input buffer.
Suppose the address of `FOO` is 102.
We push 102 on to the compilation stack `:S`.

```
    14    20    26  30 33  37   42  46   51  55 58   (mem addresses)
    zzz : XNAME YOG IF FOO ELSE BAR THEN BAZ ;  zzz  (input buffer)
                           ^
                           IP = 37

:S      :: [112, 0, 86, 102]   (definition stack of compiled word addresses)
:RELADR :: [     2         ]   (relative address stack flags 2 as relative)
CS      :: [     2         ]   (control stack refers to two byte index of null address)
```

## Parse `ELSE`

The parser shifts `ELSE` from the input buffer.
When we look `ELSE` up in the dictionary we'll find that it, like `IF`,
is a conditional word with a special compilation parser, called `:ELSE`.

`:ELSE` will inject a destination address followed by a mandatory jump command (four bytes).
But it's easier to resolve the previous if-false-relative-jump first.
Relative address 12 is after the four bytes that will be inserted.
We pop 2 from `CS` to find the jump departure location,
and replace the null place-holder (0 at 02) with relative address 12.

As earlier, we inject a null (0) destination address and a jump to `:S`.
Unlike `:IF` however, the jump `JMP` is mandatory, not conditional.
At the end of the if-true-block, we must jump over the else-false block
to the closing `THEN`.
We push a null because we do not yet know the address of the destination.
We have not parsed `THEN` yet.
Suppose the dictionary returns absolute address 126 for `JMP`.

We push 0 and 126 into `:S`, then 8 into both `:RELADR` and `CS`.

```
:S      :: [112, 12, 86, 102, 0, 126]   (definition stack of compiled addresses)
:RELADR :: [      2           8     ]   (relative addresses at 2 and 8)
CS      :: [                  8     ]   (control stack with only 8 to update)
```

## Compile third executable word or number in the false-else-block

The parser shifts `BAR` from the input buffer.
Suppose the address of `BAR` is 90.
We push 90 on to the compilation stack `:S`.

This `BAR` at address 90 is the first word of the else-block that the false-condition will jump to.
It's the sixth two byte relative address, hense `12 &JMP=0` [12 86] conditionally jumps here.

```
    14    20    26  30 33  37   42  46   51  55 58   (mem addresses)
    zzz : XNAME YOG IF FOO ELSE BAR THEN BAZ ;  zzz  (input buffer)
                                    ^               ^
                                    IP = 46       (end of input)

:S      :: [112, 12, 86, 102, 0, 126, 90 ]   (definition stack of compiled adr.s)
:RELADR :: [      2           8          ]   (relative addresses at 2 and 8)
CS      :: [                  8          ]   (control stack with only 8 to update)
```

## Let `THEN` be done!

Finally, we come to shift `THEN`.
Like `IF` and `ELSE`, we need to parse with a special compilation version called `:THEN`
because its compilation behaviour will differ from its input interpretation and compiled execution.

We can now resolve the mandatory jump from the end of the if-true-block.
Whatever will come after `THEN`, its relative address will be 14.
We pop 8 from the control stack `CS`,
and replace the null (0) at 8 (index 4 times 2 bytes) in `:S`
with relative destination address 14.

```
:S      :: [112, 12, 86, 102, 14, 126, 90 ]   (definition stack of compiled adr.s)
:RELADR :: [      2            8          ]   (relative addresses at 2 and 8)
CS      :: []                                 (control stack, empty)
```

## Compile fourth executable word or number `BAZ` after `THEN`

The parser shifts `BAZ` from the input buffer.
Suppose the address of `BAZ` is 108.
We push 108 on to the compilation stack `:S`.

```
    14    20    26  30 33  37   42  46   51  55 58   (mem addresses)
    zzz : XNAME YOG IF FOO ELSE BAR THEN BAZ ;  zzz  (input buffer)
                                             ^
                                             IP = 55

:S      :: [112, 12, 86, 102, 14, 126, 90, 108 ]   (def. stack, compiled adrs)
:RELADR :: [      2            8               ]   (rel. adrs at 2 and 8)
:NAME   :: XNAME                                   (name of the word to be compiled)
```

## Wrap up the compilation with `;`

Now we come to the end of the compiled word.
Parser `:_P` shifts `;` from the input buffer and executes `;`.

`;` can insert the compiled stack into the latest free section of memory at `MEMP`.
Suppose the latest free section of memory starts at absolute address 80.
We pop `:RELADR` and sum the value of its corresponding `:S` location with `MEMP`.
For example pop 8, the relative address at 8 in `:S` is 14.
Replace 14 at 8 with (80 14 +), which is 94.
Pop 2 from `:RELADR` corresponding to relative address 12 plus 80 is 92.

Push address 0 (null) to `:S` to indicate the end of the word definition.
Add "XNAME" and its definition
`[112, 92, 86, 102, 94, 126, 90, 108, 0 ]` to the dictionary.
The dictionary will set the word to point to address 80
and will bump `MEMP` to 98
(the next two free bytes after our final compiled address 96).
Empty `:S` and most other compilation stacks and temporary variables.

```
               ______       _______
"XNAME" =  80  82  84   86  88   90  92   94  96    (absolute memory addresses)
         [112, 92, 86, 102, 94, 126, 90, 108,  0]   (compiled address values)
               -+----       -+-----   ^    ^
                |            |        |    |
                +------------|--------+    |
                             |             |
                             +-------------+
```

## Conclusion

The logic seems to work.
I'd like to learn the ANS variables and whether there are better
ways to do the same things.
