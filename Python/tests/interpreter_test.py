from north.dictionary import Dictionary
from north.interpreter import Interpreter
from north.memory import Memory
from north.stack import Stack
import unittest


class InterpreterTest(unittest.TestCase):
    def assertExecuteStack(self, execStr, expectStack, message=None):
        if message is None:
            message = "execute(" + execStr + ") expect stack: " + str(expectStack)
        self.interpreter.execute(execStr)
        self.assertEqual(str(self.interpreter.stack), expectStack, message)

    def assertExecutePop(self, execStr, expectPop, message=None):
        if message is None:
            message = "execute(" + execStr + ") expect pop: " + str(expectPop)
        self.interpreter.execute(execStr)
        self.assertEqual(self.interpreter.stack.pop(), expectPop, message)

    def setUp(self):
        # memory_0 = Memory(48)
        # dictionary_0 = Dictionary(memory_0)
        # stack_0 = Stack()
        # self.interpreter = Interpreter(dictionary_0, stack_0, memory_0)
        self.interpreter = Interpreter()

    def test_if_simple(self):
        self.assertExecutePop("1 IF 2 ELSE 3 THEN", 2)
        self.assertExecuteStack("1 IF ELSE 3 THEN", "")
        self.assertExecutePop("1 IF 2 THEN", 2)
        self.assertExecutePop("-1 IF 2 ELSE 3 THEN", 2)
        self.assertExecutePop("0 IF ELSE 3 THEN", 3)
        self.assertExecuteStack("2 IF 2 THEN", "2")

    def test_if_nested(self):
        self.assertExecuteStack(": IS_SIX DUP <0 IF DROP 0 ELSE DUP >0 IF 6 = IF 1 ELSE 0 THEN ELSE DROP 0 THEN THEN ;", "")
        self.assertExecutePop("-6 IS_SIX", 0)
        self.assertExecutePop("0 IS_SIX", 0)
        self.assertExecutePop("1 IS_SIX", 0)
        self.assertExecutePop("5 IS_SIX", 0)
        self.assertExecutePop("6 IS_SIX", 1)
        self.assertExecuteStack("7 IS_SIX", "0")

    def test_if_else_then_example_if(self):
        self.assertExecutePop(": IS_NOT_ZERO DUP IF 7 ELSE 9 THEN ; 0 IS_NOT_ZERO", 9)
        self.assertExecutePop("1 IS_NOT_ZERO", 7)
        self.assertExecutePop("7 IS_NOT_ZERO", 7)
        self.assertExecutePop("-1 IS_NOT_ZERO", 7)
        self.assertExecutePop("0 IS_NOT_ZERO", 9)

    def test_if_else_then_dup(self):
        self.assertExecutePop(": IS_TEN DUP 10 = IF 3 ELSE 4 THEN ; 0 IS_TEN", 4)
        self.assertExecutePop("-1 IS_TEN", 4)
        self.assertExecutePop("0 IS_TEN", 4)
        self.assertExecutePop("1 IS_TEN", 4)
        self.assertExecutePop("10 IS_TEN", 3)
        self.assertExecutePop("11 IS_TEN", 4)

    def test_if_absolute_else_only(self):
        self.assertExecutePop(": E_ABS DUP >=0 IF ELSE 0 SWAP - THEN ; 6 E_ABS", 6)
        self.assertExecutePop("-1 E_ABS", 1)
        self.assertExecutePop("0 E_ABS", 0)
        self.assertExecutePop("4 E_ABS", 4)
        self.assertExecutePop("-7 E_ABS", 7)

    def test_if_absolute_no_else(self):
        self.assertExecutePop(": M_ABS DUP <0 IF 0 SWAP - THEN ; 6 M_ABS", 6)
        self.assertExecutePop("-1 M_ABS", 1)
        self.assertExecutePop("0 M_ABS", 0)
        self.assertExecutePop("4 M_ABS", 4)
        self.assertExecutePop("-7 M_ABS", 7)

    def test_logical_or(self):
        self.assertExecutePop("1 0 OR", 1)
        self.assertExecutePop("1 2 OR", 3)
        self.assertExecutePop("2 2 OR", 2)
        self.assertExecutePop("27 8 OR", 27)
        self.assertExecutePop("7 5 OR", 7)
        self.assertExecutePop("11 15 OR", 15)

    def test_logical_xor(self):
        self.assertExecutePop("0 0 XOR", 0)
        self.assertExecutePop("1 0 XOR", 1)
        self.assertExecutePop("1 2 XOR", 3)
        self.assertExecutePop("2 2 XOR", 0)
        self.assertExecutePop("2 3 XOR", 1)
        self.assertExecutePop("7 5 XOR", 2)

    def test_logical_and(self):
        self.assertExecutePop("1 0 AND", 0)
        self.assertExecutePop("1 2 AND", 0)
        self.assertExecutePop("2 2 AND", 2)
        self.assertExecutePop("27 8 AND", 8)
        self.assertExecutePop("7 5 AND", 5)
        self.assertExecutePop("11 15 AND", 11)

    def test_compare_two_equal(self):
        self.assertExecutePop("0 0 =", 1)
        self.assertExecutePop("-1 -1 =", 1)
        self.assertExecutePop("1 0 =", 0)
        self.assertExecutePop("0 1 =", 0)
        self.assertExecutePop("-1 1 =", 0)

    def test_compare_two_less_than(self):
        self.assertExecutePop("0 0 <", 0)
        self.assertExecutePop("0 1 <", 1)
        self.assertExecutePop("1 0 <", 0)
        self.assertExecutePop("1 1 <", 0)
        self.assertExecutePop("-1 0 <", 1)
        self.assertExecutePop("-1 -2 <", 0)

    def test_compare_two_greater_than(self):
        self.assertExecutePop("0 0 >", 0)
        self.assertExecutePop("0 1 >", 0)
        self.assertExecutePop("1 0 >", 1)
        self.assertExecutePop("1 1 >", 0)
        self.assertExecutePop("-1 0 >", 0)
        self.assertExecutePop("-1 -2 >", 1)

    def test_logical_equal_zero(self):
        self.assertExecuteStack("0 =0", "1")
        self.assertExecuteStack("=0", "0")
        self.assertExecutePop("=0", 1)
        self.assertExecuteStack("", "")
        self.assertExecutePop("0 =0", 1)
        self.assertExecutePop("1 =0", 0)
        self.assertExecutePop("-6 =0", 0)

    def test_logical_less_than_zero(self):
        self.assertExecutePop("-1 <0", 1)
        self.assertExecutePop("0 <0", 0)
        self.assertExecutePop("1 <0", 0)

    def test_logical_greater_than_zero(self):
        self.assertExecutePop("-1 >0", 0)
        self.assertExecutePop("0 >0", 0)
        self.assertExecutePop("1 >0", 1)

    def test_logical_less_equal_zero(self):
        self.assertExecutePop("-1 <=0", 1)
        self.assertExecutePop("0 <=0", 1)
        self.assertExecutePop("1 <=0", 0)

    def test_logical_greater_equal_zero(self):
        self.assertExecutePop("-1 >=0", 0)
        self.assertExecutePop("0 >=0", 1)
        self.assertExecutePop("1 >=0", 1)

    def test_drop(self):
        self.assertExecuteStack("8 6 4 DROP", "8 6")

    def test_dup(self):
        self.assertExecuteStack("8 7 DUP", "8 7 7")
        self.assertExecuteStack("-7 DUP",  "8 7 7 -7 -7")

    def test_not(self):
        self.assertExecuteStack("8 0 NOT", "8 -1")
        self.assertExecuteStack("DROP DROP 0 DROP 1 NOT", "-2")
        self.assertExecutePop("256 NOT", -257)
        self.assertExecutePop("1234567890 NOT", -1234567891)

    def test_over(self):
        self.assertExecuteStack("5 6 7 OVER", "5 6 7 6")

    def test_rotate(self):
        self.assertExecuteStack("3 4 5 6 7 ROT", "3 4 6 7 5")

    def test_execute_none(self):
        self.assertIsNone(self.interpreter.execute(None))

    def test_execute_empty(self):
        self.assertIsNone(self.interpreter.execute(""))

    def test_execute_blank(self):
        self.assertIsNone(self.interpreter.execute("   "))

    # Will fail
    # def test_execute_bogus(self):
    #     self.assertIsNone(self.interpreter.execute("BOGUS"))

    def test_define_word_neg_define_and_run_7_neg(self):
        self.assertExecutePop(": NEG 0 SWAP - ; 7 NEG", -7)

    def test_define_word_neg_just_define(self):
        self.assertExecuteStack(": NEG 0 SWAP - ;", "")

    def test_define_word_neg_push_define_neg_after(self):
        self.assertExecutePop("5 : NEG 0 SWAP - ; NEG", -5)

    def test_define_word_neg_prior_one_command(self):
        self.assertExecutePop("3 : NEG 0 SWAP - ; NEG", -3)

    def test_interpreter_execute_push(self):
        self.assertExecutePop("1", 1)

    def test_interpreter_swap_one_line_7_9_swap(self):
        self.assertExecuteStack("7 9 SWAP", "9 7")

    def test_interpreter_swap_push2_execute(self):
        self.assertExecuteStack("5 8 SWAP", "8 5")

    def test_interpreter_add_one_line(self):
        self.assertExecutePop("19 3 4 +", 7)

    def test_interpreter_add_push2_execute_plus(self):
        self.assertExecutePop("5 8 +", 13)

    def test_interpreter_subtract_simple(self):
        self.assertExecutePop("9 6 -", 3)
        self.assertExecutePop("9 16 -", -7)

    def test_interpreter_subtract_negative_one_liner(self):
        self.assertExecutePop("7 11 -", -4)

    def test_interpreter_subtract_push2_execute_subtract(self):
        self.assertExecutePop("9 6 -", 3)

    def test_interpreter_divide_int(self):
        self.assertExecutePop("6 7 /", 0)
        self.assertExecutePop("6 6 /", 1)
        self.assertExecutePop("6 5 /", 1)
        self.assertExecutePop("6 3 /", 2)
        self.assertExecutePop("6 2 /", 3)
        self.assertExecutePop("6 1 /", 6)

    def test_interpreter_multiply(self):
        self.assertExecutePop("3 5 *", 15)

    def test_mod(self):
        self.assertExecutePop("10 5 MOD", 0)
        self.assertExecutePop("13 12 MOD", 1)

        self.assertExecutePop("10 -5 MOD", 0)
        self.assertExecutePop("13 -12 MOD", 1)

        # Negative dividend
        self.assertExecutePop("-10 5 MOD", 0)
        self.assertExecutePop("-13 12 MOD", 11)

        # Negative divisor
        self.assertExecutePop("-10 -5 MOD", 0)
        self.assertExecutePop("-13 -12 MOD", 11)

        # Zero dividend
        self.assertExecutePop("0 5 MOD", 0)
        self.assertExecutePop("0 12 MOD", 0)

        # Zero divisor
        # self.assertExecutePop("10 0 MOD", "Divide by zero error")
        # self.assertExecutePop("0 0 MOD", "Divide by zero error")

    def test_overwrite_same_colon_word_inner_old(self):
        self.assertExecuteStack(": X 7 +     ; 1 X",     "8")
        self.assertExecuteStack(": X X 100 + ; 0 X", "8 107")
        self.assertExecuteStack(": X X  10 + ; 0 X", "8 107 117")
        self.assertExecuteStack(": X DROP    ; X",      "8 107")

    # def test_program_is_prime(self):
    #     self.assertExecuteStack("""
    #         : IS_PRIME DUP 2 <= IF DROP 0 ELSE
    #            DUP 3 <= IF DROP 1 ELSE
    #              DUP 2 1 + 3 DO
    #                DUP I MOD 0 = IF DROP 0 EXIT THEN
    #              LOOP THEN THEN ;
    #         4 IS_PRIME
    #         ""","[0]")

    def test_redefine_dup_to_square(self):
        self.assertExecuteStack("5 DUP", "5 5")
        self.assertExecuteStack(": OLD_DUP DUP ; 4 OLD_DUP", "5 5 4 4")
        self.assertExecuteStack(": DUP DUP * ; 13 DUP", "5 5 4 4 169")
        self.assertExecuteStack("1 OLD_DUP", "5 5 4 4 169 1 1")

    def test_new_word_of_primitive(self):
        self.assertExecuteStack("5 DUP", "5 5")
        self.assertExecuteStack(": SQUARE DUP * ; SQUARE", "5 25")


if __name__ == "__main__":
    unittest.main()
