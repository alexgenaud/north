from north.stack import Stack

class Dictionary:
    def __init__(self):
        self.core = {}
        self.words = {}
        self.load_core_words()

    def add_word(self, word, action):
        self.words[word] = action

    def get_action(self, word):
        return self.core.get(word) or self.words.get(word)

    def __core_divide_int(self, stack):
        a = stack.pop()
        stack.push(int(stack.pop() / a))

    def __core_absolute_value(self, stack):
        a = stack.pop()
        stack.push(a if a >= 0 else -a)

    def __core_mod(self, stack):
        d = stack.pop()
        n = stack.pop()
        d = d if d >= 0 else -d
        stack.push(n % d)

    def load_core_words(self):
        # 1 pop
        self.core['DROP'] = lambda s: s.pop()
        self.core['DUP'] = lambda s: s.push(s.peek())
        self.core['NOT'] = lambda s: s.push(~ s.pop())
        self.core['ABS'] = self.__core_absolute_value
        self.core['=0'] = lambda s: s.push(1 if s.pop() == 0 else 0)
        self.core['<0'] = lambda s: s.push(1 if s.pop() < 0 else 0)
        self.core['>0'] = lambda s: s.push(1 if s.pop() > 0 else 0)

        # 2 pop pops
        self.core['+'] = lambda s: s.push(s.pop() + s.pop())
        self.core['-'] = lambda s: s.push(s.pop(-2) - s.pop())
        self.core['*'] = lambda s: s.push(s.pop() * s.pop())
        self.core['/'] = self.__core_divide_int
        self.core['='] = lambda s: s.push(1 if s.pop() == s.pop() else 0)
        self.core['<'] = lambda s: s.push(1 if s.pop() > s.pop() else 0)
        self.core['>'] = lambda s: s.push(1 if s.pop() < s.pop() else 0)
        self.core['OVER'] = lambda s: s.push(s.peek(-2))
        self.core['SWAP'] = lambda s: s.push(s.pop(-2))
        self.core['AND'] = lambda s: s.push(s.pop() & s.pop())
        self.core['OR'] = lambda s: s.push(s.pop() | s.pop())
        self.core['XOR'] = lambda s: s.push(s.pop() ^ s.pop())
        self.core['<=0'] = lambda s: s.push(1 if s.pop() <= 0 else 0)
        self.core['>=0'] = lambda s: s.push(1 if s.pop() >= 0 else 0)
        self.core['MOD'] = self.__core_mod

        # 3 pop pop pops
        self.core['ROT'] = lambda s: s.push(s.pop(-3))
