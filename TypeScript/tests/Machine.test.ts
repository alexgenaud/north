import Machine from '../north/Machine';

describe('Machine', () => {
    let machine: Machine;

    beforeEach(() => {
        machine = new Machine();
    });

    const assertExecuteStack = (execStr: string, expectStack: string) => {
        for (const token of execStr.trim().split(/\s+/)) {
            machine.execute(token);
        }
        expect(machine.opstack.toString()).toBe(expectStack);
    };

    const assertExecutePop = (execStr: string, expectPop: number) => {
        for (const token of execStr.trim().split(/\s+/)) {
            machine.execute(token);
        }
        expect(machine.opstack.pop()).toBe(expectPop);
    };

    test('add_simple', () => {
        assertExecuteStack('2 3 +', '5');
    });

    test('if_simple', () => {
        assertExecutePop('1 IF 2 ELSE 3 THEN', 2);
        assertExecuteStack('1 IF ELSE 3 THEN', '');
        assertExecutePop('1 IF 2 THEN', 2);
        assertExecutePop('-1 IF 2 ELSE 3 THEN', 2);
        assertExecutePop('0 IF ELSE 3 THEN', 3);
        assertExecuteStack('2 IF 2 THEN', '2');
    });

    test('if_nested', () => {
        assertExecuteStack(": IS_SIX DUP <0 IF DROP 0 ELSE DUP >0 IF 6 = IF 1 ELSE 0 THEN ELSE DROP 0 THEN THEN ;", "")
        assertExecutePop("-6 IS_SIX", 0)
        assertExecutePop("0 IS_SIX", 0)
        assertExecutePop("1 IS_SIX", 0)
        assertExecutePop("5 IS_SIX", 0)
        assertExecutePop("6 IS_SIX", 1)
        assertExecuteStack("7 IS_SIX", "0")
    });

    test('if_else_then_example_if', () => {
        assertExecutePop(": IS_NOT_ZERO DUP IF 7 ELSE 9 THEN ; 0 IS_NOT_ZERO", 9)
        assertExecutePop("1 IS_NOT_ZERO", 7)
        assertExecutePop("7 IS_NOT_ZERO", 7)
        assertExecutePop("-1 IS_NOT_ZERO", 7)
        assertExecutePop("0 IS_NOT_ZERO", 9)
    });

    test('if_else_then_example_if', () => {
        assertExecutePop(": IS_NOT_ZERO DUP IF 7 ELSE 9 THEN ; 0 IS_NOT_ZERO", 9)
        assertExecutePop("1 IS_NOT_ZERO", 7)
        assertExecutePop("7 IS_NOT_ZERO", 7)
        assertExecutePop("-1 IS_NOT_ZERO", 7)
        assertExecutePop("0 IS_NOT_ZERO", 9)
    });

    test('if_else_then_dup', () => {
        assertExecutePop(": IS_TEN DUP 10 = IF 3 ELSE 4 THEN ; 0 IS_TEN", 4)
        assertExecutePop("-1 IS_TEN", 4)
        assertExecutePop("0 IS_TEN", 4)
        assertExecutePop("1 IS_TEN", 4)
        assertExecutePop("10 IS_TEN", 3)
        assertExecutePop("11 IS_TEN", 4)
    });

    test('if_absolute_else_only', () => {
        assertExecutePop(": E_ABS DUP >=0 IF ELSE 0 SWAP - THEN ; 6 E_ABS", 6)
        assertExecutePop("-1 E_ABS", 1)
        assertExecutePop("0 E_ABS", 0)
        assertExecutePop("4 E_ABS", 4)
        assertExecutePop("-7 E_ABS", 7)
    });

    test('if_absolute_no_else', () => {
        assertExecutePop(": M_ABS DUP <0 IF 0 SWAP - THEN ; 6 M_ABS", 6)
        assertExecutePop("-1 M_ABS", 1)
        assertExecutePop("0 M_ABS", 0)
        assertExecutePop("4 M_ABS", 4)
        assertExecutePop("-7 M_ABS", 7)
    });

    test('logical_or', () => {
        assertExecutePop("1 0 OR", 1)
        assertExecutePop("1 2 OR", 3)
        assertExecutePop("2 2 OR", 2)
        assertExecutePop("27 8 OR", 27)
        assertExecutePop("7 5 OR", 7)
        assertExecutePop("11 15 OR", 15)
    });

    test('logical_xor', () => {
        assertExecutePop("0 0 XOR", 0)
        assertExecutePop("1 0 XOR", 1)
        assertExecutePop("1 2 XOR", 3)
        assertExecutePop("2 2 XOR", 0)
        assertExecutePop("2 3 XOR", 1)
        assertExecutePop("7 5 XOR", 2)
    });

    test('logical_and', () => {
        assertExecutePop("1 0 AND", 0)
        assertExecutePop("1 2 AND", 0)
        assertExecutePop("2 2 AND", 2)
        assertExecutePop("27 8 AND", 8)
        assertExecutePop("7 5 AND", 5)
        assertExecutePop("11 15 AND", 11)
    });

    test('compare_two_equal', () => {
        assertExecutePop("0 0 =", 1)
        assertExecutePop("-1 -1 =", 1)
        assertExecutePop("1 0 =", 0)
        assertExecutePop("0 1 =", 0)
        assertExecutePop("-1 1 =", 0)
    });

    test('compare_two_less_than', () => {
        assertExecutePop("0 0 <", 0)
        assertExecutePop("0 1 <", 1)
        assertExecutePop("1 0 <", 0)
        assertExecutePop("1 1 <", 0)
        assertExecutePop("-1 0 <", 1)
        assertExecutePop("-1 -2 <", 0)
    });

    test('compare_two_greater_than', () => {
        assertExecutePop("0 0 >", 0)
        assertExecutePop("0 1 >", 0)
        assertExecutePop("1 0 >", 1)
        assertExecutePop("1 1 >", 0)
        assertExecutePop("-1 0 >", 0)
        assertExecutePop("-1 -2 >", 1)
    });

    test('logical_equal_zero', () => {
        assertExecuteStack("0 =0", "1")
        assertExecuteStack("=0", "0")
        assertExecutePop("=0", 1)
        assertExecuteStack("", "")
        assertExecutePop("0 =0", 1)
        assertExecutePop("1 =0", 0)
        assertExecutePop("-6 =0", 0)
    });

    test('logical_less_than_zero', () => {
        assertExecutePop("-1 <0", 1)
        assertExecutePop("0 <0", 0)
        assertExecutePop("1 <0", 0)
    });

    test('logical_greater_than_zero', () => {
        assertExecutePop("-1 >0", 0)
        assertExecutePop("0 >0", 0)
        assertExecutePop("1 >0", 1)
    });

    test('logical_less_equal_zero', () => {
        assertExecutePop("-1 <=0", 1)
        assertExecutePop("0 <=0", 1)
        assertExecutePop("1 <=0", 0)
    });

    test('logical_greater_equal_zero', () => {
        assertExecutePop("-1 >=0", 0)
        assertExecutePop("0 >=0", 1)
        assertExecutePop("1 >=0", 1)
    });

    test('drop', () => {
        assertExecuteStack("8 6 4 DROP", "8 6")
    });

    test('dup', () => {
        assertExecuteStack("8 7 DUP", "8 7 7")
        assertExecuteStack("-7 DUP",  "8 7 7 -7 -7")
    });

    test('not', () => {
        assertExecuteStack("8 0 NOT", "8 -1")
        assertExecuteStack("DROP DROP 0 DROP 1 NOT", "-2")
        assertExecutePop("256 NOT", -257)
        assertExecutePop("1234567890 NOT", -1234567891)
    });

    test('over', () => {
        assertExecuteStack("5 6 7 OVER", "5 6 7 6")
    });

    test('rotate', () => {
        assertExecuteStack("3 4 5 6 7 ROT", "3 4 6 7 5")
    });

    // Will fail
    // test('execute_none', () => {
    //     assertExecuteStack(null, "");
    // });

    test('execute_empty', () => {
        assertExecuteStack("", "");
    });

    test('execute_blank', () => {
        assertExecuteStack("   ", "");
    });

    // Will fail
    // test('execute_bogus', () => {
    //    assertExecuteStack("BOGUS", "")
    // });

    test('define_word_neg_define_and_run_7_neg', () => {
        assertExecutePop(": NEG 0 SWAP - ; 7 NEG", -7)
    });

    test('define_word_neg_just_define', () => {
        assertExecuteStack(": NEG 0 SWAP - ;", "")
    });

    test('define_word_neg_push_define_neg_after', () => {
        assertExecutePop("5 : NEG 0 SWAP - ; NEG", -5)
    });

    test('define_word_neg_prior_one_command', () => {
        assertExecutePop("3 : NEG 0 SWAP - ; NEG", -3)
    });

    test('machine_execute_push', () => {
        assertExecutePop("1", 1)
    });

    test('machine_swap_one_line_7_9_swap', () => {
        assertExecuteStack("7 9 SWAP", "9 7")
    });

    test('machine_swap_push2_execute', () => {
        assertExecuteStack("5 8 SWAP", "8 5")
    });

    test('machine_add_one_line', () => {
        assertExecutePop("19 3 4 +", 7)
    });

    test('machine_add_push2_execute_plus', () => {
        assertExecutePop("5 8 +", 13)
    });

    test('machine_subtract_simple', () => {
        assertExecutePop("9 6 -", 3)
        assertExecutePop("9 16 -", -7)
    });

    test('machine_subtract_negative_one_liner', () => {
        assertExecutePop("7 11 -", -4)
    });

    test('machine_subtract_push2_execute_subtract', () => {
        assertExecutePop("9 6 -", 3)
    });

    test('machine_divide_int', () => {
        assertExecutePop("6 7 /", 0)
        assertExecutePop("6 6 /", 1)
        assertExecutePop("6 5 /", 1)
        assertExecutePop("6 3 /", 2)
        assertExecutePop("6 2 /", 3)
        assertExecutePop("6 1 /", 6)
    });

    test('should throw an error when dividing by zero', () => {
        machine.opstack.push(10);
        machine.opstack.push(0);
        expect(() => {
            machine.dictionary['divideInt'](machine);
        }).toThrowError('Divisor must be non-zero int');
    });

    test('should throw an error when numerator not a number', () => {
        machine.opstack.push("ABC");
        machine.opstack.push(7);
        expect(() => {
            machine.dictionary['divideInt'](machine);
        }).toThrowError('Numerator must be a number');
    });

    test('machine_multiply', () => {
        assertExecutePop("3 5 *", 15)
    });

    test('mod', () => {
        assertExecutePop("10 5 MOD", 0)
        assertExecutePop("13 12 MOD", 1)

        assertExecutePop("10 -5 MOD", 0)
        assertExecutePop("13 -12 MOD", 1)

        // # Negative dividend
        assertExecutePop("-10 5 MOD", 0)
        assertExecutePop("-13 12 MOD", 11)

        // # Negative divisor
        assertExecutePop("-10 -5 MOD", 0)
        assertExecutePop("-13 -12 MOD", 11)

        // # Zero dividend
        assertExecutePop("0 5 MOD", 0)
        assertExecutePop("0 12 MOD", 0)

        // # Zero divisor
        // # assertExecutePop("10 0 MOD", "Divide by zero error")
        // # assertExecutePop("0 0 MOD", "Divide by zero error")
    });

    test('overwrite_same_colon_word_inner_old', () => {
        assertExecuteStack(": X 7 +     ; 1 X",     "8")
        assertExecuteStack(": X X 100 + ; 0 X", "8 107")
        assertExecuteStack(": X X  10 + ; 0 X", "8 107 117")
        assertExecuteStack(": X DROP    ; X",      "8 107")
    });

    /*
    test('program_is_prime', () => {
        assertExecuteStack("""
            : IS_PRIME DUP 2 <= IF DROP 0 ELSE
               DUP 3 <= IF DROP 1 ELSE
                 DUP 2 1 + 3 DO
                   DUP I MOD 0 = IF DROP 0 EXIT THEN
                 LOOP THEN THEN ;
            4 IS_PRIME
            ""","[0]")
    });
    */

    test('redefine_dup_to_square', () => {
        assertExecuteStack("5 DUP", "5 5")
        assertExecuteStack(": OLD_DUP DUP ; 4 OLD_DUP", "5 5 4 4")
        assertExecuteStack(": DUP DUP * ; 13 DUP", "5 5 4 4 169")
        assertExecuteStack("1 OLD_DUP", "5 5 4 4 169 1 1")
    });

    test('new_word_of_primitive', () => {
        assertExecuteStack("5 DUP", "5 5")
        assertExecuteStack(": SQUARE DUP * ; SQUARE", "5 25")
    });

    test('new_constant', () => {
        assertExecutePop("5 CONST five 15 five /", 3)
        assertExecuteStack("5 CONST five 314 CONST Pi100 35 five / Pi100 100 /", "7 3")
        assertExecutePop("* 1 + 100 * Pi100 /", 7); // 22 / 3.14 > 7
    });

    test('new_constant_days_julian_cal_century', () => {
        assertExecutePop("36525 CONST DAYS_JULI_CENT 365 100 * 100 4 / + DAYS_JULI_CENT =", 1)
        assertExecutePop("36522 CONST DAYS_GREG_CENT DAYS_JULI_CENT DAYS_GREG_CENT -", 3)
    });

    test('new_variable', () => {
        assertExecutePop("VAR six six @", 0); // 0 unset value
        assertExecutePop("7 six ! six @", 7);
        assertExecuteStack("six @ 1 - six ! six @", "6");
    });

    test('new_var_meton_example', () => {
        // VAR meton addressA-> 0, addressB->B, "meton"->addressB
        assertExecutePop("VAR meton 235 meton ! meton @", 235); // 0 unset value
    });

});

