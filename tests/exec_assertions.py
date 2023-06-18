import unittest

class ExecAssertions(unittest.TestCase):
    def assertExecuteStack(self, execStr, expectStack, message=None):
        message = "[" + execStr +"] expect "+ str(expectStack) if message is None else message;
        self.interpreter.execute(execStr)
        self.assertEqual(str(self.stack), expectStack, message)

    def assertExecutePop(self, execStr, expectPop, message=None):
        message = "[" + execStr +"] expect pop: "+ str(expectPop) if message is None else message;
        self.interpreter.execute(execStr)
        self.assertEqual(self.stack.pop(), expectPop, message)
