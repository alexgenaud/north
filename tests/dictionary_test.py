import unittest
from north.dictionary import Dictionary

class DictionaryTestCase(unittest.TestCase):
    def setUp(self):
        self.dictionary = Dictionary()

    def test_add_word(self):
        self.dictionary.add_word('DUP', lambda stack: stack.push(stack.peek()))
        self.dictionary.add_word('DROP', lambda stack: stack.pop())
        self.assertEqual(len(self.dictionary.words), 2)
        self.assertIsNotNone(self.dictionary.get_action("DUP"))
        self.assertIsNotNone(self.dictionary.get_action("DROP"))

    def test_get_action(self):
        self.dictionary.add_word('DUP', lambda stack: stack.push(stack.peek()))
        action = self.dictionary.get_action('DUP')
        self.assertIsNotNone(action)
        self.assertTrue(callable(action))
        self.dictionary.add_word('SWAP', lambda stack: stack.push(stack.pop()))
        action = self.dictionary.get_action('SWAP')
        self.assertIsNotNone(action)
        self.assertTrue(callable(action))
        action = self.dictionary.get_action('BOGUS')
        self.assertIsNone(action)
        self.assertFalse(callable(action))


if __name__ == '__main__':
    unittest.main()
