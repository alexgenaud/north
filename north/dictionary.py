from north.stack import Stack
from north.memory import Memory

class Dictionary:
    def __init__(self, memory):
        self.core = {} # collision map: hash table of lists
        self.memory = memory
        self.load_core_words()

    def add_word(self, word, action):
        assert isinstance(word, str), "Dictionary word must be str" # maybe int or json in future
        assert len(word) > 0, "Dictionary word must not be empty"
        assert isinstance(action, (str, int)) or callable(action), "Dictionary action must be str, int or callable"

        action_list = self.core.get(word, None)
        if action_list is None:
            self.core[word] = []
        self.core[word].append(self.memory.write(action))

    def get_action(self, word):
        assert isinstance(word, str), "Dictionary word must be str" # maybe int or json in future
        assert len(word) > 0, "Dictionary word must not be empty"
        action_list = self.core.get(word, None)
        memory_address = None if action_list is None else action_list[-1]
        return None if memory_address is None else self.memory.read(memory_address)

    def __core_divide_int(self, stack):
        a = stack.pop()
        assert isinstance(a, int), "Int / divisor must be int. Was "+ str(a)
        assert a != 0, "Divide by zero. Was "+ str(a)
        b = stack.pop()
        assert isinstance(b, int), "Int / numerator must be int. Was "+ str(b)
        stack.push(int(b / a))

    def __core_absolute_value(self, stack):
        a = stack.pop()
        stack.push(a if a >= 0 else -a)

    def __core_mod(self, stack):
        d = stack.pop()
        assert isinstance(d, int), "Modulo divisor must be int. Was "+ str(d)
        assert d != 0, "Modulo by zero. Was "+ str(d)
        n = stack.pop()
        assert isinstance(d, int), "Modulo numerator must be int. Was "+ str(d)
        d = d if d >= 0 else -d
        stack.push(n % d)

    def load_core_words(self):
        # 1 pop
        self.add_word('DROP', lambda s: s.pop() )
        self.add_word('DUP', lambda s: s.push(s.peek()) )
        self.add_word('NOT', lambda s: s.push(~ s.pop()) )
        self.add_word('ABS', self.__core_absolute_value )
        self.add_word('=0', lambda s: s.push(1 if s.pop() == 0 else 0) )
        self.add_word('<0', lambda s: s.push(1 if s.pop() < 0 else 0) )
        self.add_word('>0', lambda s: s.push(1 if s.pop() > 0 else 0) )

        # 2 pop pops
        self.add_word('+', lambda s: s.push(s.pop() + s.pop()) )
        self.add_word('-', lambda s: s.push(s.pop(-2) - s.pop()) )
        self.add_word('*', lambda s: s.push(s.pop() * s.pop()) )
        self.add_word('/', self.__core_divide_int )
        self.add_word('=', lambda s: s.push(1 if s.pop() == s.pop() else 0) )
        self.add_word('<', lambda s: s.push(1 if s.pop() > s.pop() else 0) )
        self.add_word('>', lambda s: s.push(1 if s.pop() < s.pop() else 0) )
        self.add_word('OVER', lambda s: s.push(s.peek(-2)) )
        self.add_word('SWAP', lambda s: s.push(s.pop(-2)) )
        self.add_word('AND', lambda s: s.push(s.pop() & s.pop()) )
        self.add_word('OR', lambda s: s.push(s.pop() | s.pop()) )
        self.add_word('XOR', lambda s: s.push(s.pop() ^ s.pop()) )
        self.add_word('<=0', lambda s: s.push(1 if s.pop() <= 0 else 0) )
        self.add_word('>=0', lambda s: s.push(1 if s.pop() >= 0 else 0) )
        self.add_word('MOD', self.__core_mod )

        # 3 pop pop pops
        self.add_word('ROT', lambda s: s.push(s.pop(-3)) )

    def __str__(self):
        indent = ''
        result = ''
        for key, value in self.core.items():
            result += f"{indent}{key}: "
            if isinstance(value, list):
                formatted_items = [
                        str(item) if not callable(item) else 'call'
                        for item in value]
                result += f"[ {', '.join(formatted_items)} ]"
            elif isinstance(value, dict):
                result += 'dict\n'
            elif callable(value):
                result += 'call\n'
            else:
                result += str(value)
            result += '\n'
        return result

