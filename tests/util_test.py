import unittest
from north.util import isInt

class TestUnil(unittest.TestCase):
    def test_util_isInt(self):
        self.assertTrue(isInt(-7))
        self.assertTrue(isInt(0))
        self.assertTrue(isInt(7))

        self.assertTrue(isInt(True))
        self.assertTrue(isInt(False))

        self.assertFalse(isInt(7.1))
        self.assertFalse(isInt(7.0))
        self.assertFalse(isInt(7.))

        self.assertTrue(isInt("-7"))
        self.assertTrue(isInt("0"))
        self.assertTrue(isInt("7"))
        self.assertFalse(isInt("7.1"))
        self.assertFalse(isInt("7.0"))
        self.assertFalse(isInt("7."))

        self.assertEqual(0, 0)

#if __name__ == '__main__':
#    unittest.main()
