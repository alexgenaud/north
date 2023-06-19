from io import StringIO
from north.dictionary import Dictionary
from north.interpreter import Interpreter
from north.memory import Memory
from north.stack import Stack
import unittest

class InterpreterTest(unittest.TestCase):
    def assertExecuteStack(self, execStr, expectStack, message=None):
        if message is None:
            message = "execute(" + execStr +") expect stack: "+ str(expectStack)
        self.interpreter.execute(execStr)
        self.assertEqual(str(self.stack), expectStack, message)

    def assertExecutePop(self, execStr, expectPop, message=None):
        if message is None:
            message = "execute(" + execStr +") expect pop: "+ str(expectPop)
        self.interpreter.execute(execStr)
        self.assertEqual(self.stack.pop(), expectPop, message)

    def setUp(self):
        self.memory = Memory()
        self.dictionary = Dictionary(self.memory)
        self.stack = Stack()
        self.interpreter = Interpreter(self.dictionary, self.stack, self.memory)

    def test_if_else_then_example_if(self):
        self.assertExecutePop(": IS_NOT_ZERO DUP IF 7 ELSE 9 THEN ; 0 IS_NOT_ZERO", 9)
        self.assertExecutePop("1 IS_NOT_ZERO", 7)
        self.assertExecutePop("7 IS_NOT_ZERO", 7)
        self.assertExecutePop("-1 IS_NOT_ZERO", 7)
        self.assertExecutePop("0 IS_NOT_ZERO", 9)

    def test_if_else_then_dup(self):
        self.assertExecutePop(
            ": IS_TEN DUP 10 = IF 3 ELSE 4 THEN ; 0 IS_TEN", 4)
        self.assertExecutePop("-1 IS_TEN", 4)
        self.assertExecutePop("0 IS_TEN", 4)
        self.assertExecutePop("1 IS_TEN", 4)
        self.assertExecutePop("10 IS_TEN", 3)
        self.assertExecutePop("11 IS_TEN", 4)

    def test_if_absolute_value_no_if_block(self):
        self.assertExecutePop(
            ": E_ABS DUP >=0 IF ELSE 0 SWAP - THEN ; 6 E_ABS", 6)
        self.assertExecutePop("-1 E_ABS", 1)
        self.assertExecutePop("0 E_ABS", 0)
        self.assertExecutePop("4 E_ABS", 4)
        self.assertExecutePop("-7 E_ABS", 7)

    def test_if_absolute_value_no_else(self):
        self.assertExecutePop(
            ": M_ABS DUP <0 IF 0 SWAP - THEN ; 6 M_ABS", 6)
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

    def test_execute_bogus(self):
        self.assertIsNone(self.interpreter.execute("BOGUS"))

    def test_execute_none(self):
        self.assertIsNone(self.interpreter.execute(None))

    def test_define_word_neg_define_and_run_7_neg(self):
        self.interpreter.execute(": NEG 0 SWAP - ;")
        self.assertExecutePop("7 NEG", -7)

    def test_define_word_neg_just_define(self):
        self.assertExecuteStack(": NEG 0 SWAP - ;", "")

    def test_define_word_neg_push_define_neg_after(self):
        self.stack.push(5)
        self.interpreter.execute(": NEG 0 SWAP - ;")
        self.interpreter.execute("NEG")
        self.assertEqual(self.interpreter.stack.pop(), -5)

    def test_define_word_neg_prior_one_command(self):
        self.assertExecutePop("3 : NEG 0 SWAP - ; NEG", -3)

    def test_interpreter_execute_push(self):
        self.assertExecutePop("1", 1)

    def test_interpreter_swap_one_line_7_9_swap(self):
        self.assertExecutePop("7 9 SWAP", 7)
        self.assertEqual(self.stack.pop(), 9)

    def test_interpreter_swap_push2_execute(self):
        self.stack.push(5)
        self.stack.push(8)
        self.assertExecutePop("SWAP", 5)
        self.assertEqual(self.stack.pop(), 8)

    def test_interpreter_add_one_line(self):
        self.assertExecutePop("19 3 4 +", 7)

    def test_interpreter_add_push2_execute_plus(self):
        self.stack.push(5)
        self.stack.push(8)
        self.assertExecutePop("+", 13)

    def test_interpreter_subtract_simple(self):
        self.assertExecutePop("9 6 -", 3)
        self.assertExecutePop("9 16 -", -7)

    def test_interpreter_subtract_negative_one_liner(self):
        self.assertExecutePop("7 11 -", -4)

    def test_interpreter_subtract_push2_execute_subtract(self):
        self.stack.push(8)
        self.stack.push(5)
        self.assertExecutePop("-", 3)

    def test_interpreter_divide_int(self):
        self.assertExecutePop("6 7 /", 0)
        self.assertExecutePop("6 6 /", 1)
        self.assertExecutePop("6 5 /", 1)
        self.assertExecutePop("6 3 /", 2)
        self.assertExecutePop("6 2 /", 3)
        self.assertExecutePop("6 1 /", 6)

    def test_interpreter_multiply(self):
        self.stack.push(3)
        self.stack.push(5)
        self.assertExecutePop("*", 15)

    def test_interpreter_multiply(self):
        self.stack.push(3)
        self.stack.push(5)
        self.assertExecutePop("*", 15)

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


#    def test_program_is_prime(self):
#        self.assertExecuteStack(
#            ": IS_PRIME DUP 2 <= IF DROP 0 ELSE"+
#            "    DUP 3 <= IF DROP 1 ELSE"+
#            "      DUP 2 1 + 3 DO"+
#            "        DUP I MOD 0 = IF DROP 0 EXIT THEN"+
#            "      LOOP THEN THEN ; "+
#            " 4 IS_PRIME", "[0]")

    def test_redefine_primitives(self):
        # DUP does what we expect, duplicates 5
        self.assertExecuteStack("5 DUP", "5 5")

        # create a function (SQUARE) that uses old DUP
        # (and multiplies the value by itself)
        # then run SQUARE popping one of two 5 from the stack
        self.assertExecuteStack(": SQUARE DUP * ; SQUARE", "5 25")

        # Redefine DUP to instead increment a copy by one
        # self.assertExecuteStack(": DUP DUP 1 + ; DUP", "5 25 26")
        # FIXME new DUP should use old DUP
        # TODO default is not to recurse (although there could be a RECURSE word)

if __name__ == "__main__":
    unittest.main()

