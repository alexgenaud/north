import unittest
from north.memory import Memory


class TestMemory(unittest.TestCase):
    def setUp(self):
        self.size = 4
        self.memory = Memory(self.size)

    def test_read_empty_memory(self):
        for i in range(self.size):
            self.assertEqual(self.memory.read(i), 0)

    def test_write_first(self):
        self.assertEqual(self.memory.read(0), 0)
        self.assertEqual(self.memory.write("A"), 0)
        self.assertEqual(self.memory.read(0), "A")
        self.assertEqual(self.memory.read(1), 0)

    def test_write_middle_next(self):
        self.assertEqual(self.memory.write("X", 2), 2)
        self.assertEqual(self.memory.read(2), "X")
        self.assertEqual(self.memory.write("Y"), 3)
        self.assertEqual(self.memory.read(0), 0)
        self.assertEqual(self.memory.read(1), 0)
        self.assertEqual(self.memory.read(2), "X")
        self.assertEqual(self.memory.read(3), "Y")

    # assert instead.
    #
    # def test_out_of_bounds(self):
    #     self.assertRaises(IndexError,
    #             lambda: self.memory.read(self.size))
    #     self.assertRaises(IndexError,
    #             lambda: self.memory.read(-1))


if __name__ == '__main__':
    unittest.main()
