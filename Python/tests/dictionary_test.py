import unittest
from north.dictionary import Dictionary
from north.memory import Memory


class DictionaryTestCase(unittest.TestCase):
    def setUp(self):
        self.memory = Memory()
        self.dictionary = Dictionary(self.memory)

    def test_add_word(self):
        len_dict_start = len(self.dictionary.core)
        self.assertTrue(len_dict_start > 9)
        len_dup_start = len(self.dictionary.core['DUP'])
        self.assertEqual(len_dup_start, 1)
        len_drop_start = len(self.dictionary.core['DROP'])
        self.assertEqual(len_drop_start, 1)
        self.dictionary.add_word('DUP', lambda stack: stack.push(stack.peek()))
        self.dictionary.add_word('DROP', lambda stack: stack.pop())
        self.assertEqual(len(self.dictionary.core), len_dict_start)
        self.assertEqual(len(self.dictionary.core['DUP']), 2)
        self.assertEqual(len(self.dictionary.core['DROP']), 2)
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
