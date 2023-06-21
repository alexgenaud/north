from north.stack import Stack
from north.memory import Memory
from north.util import isInt

class Dictionary:
    def __init__(self, memory):
        self.core = {} # collision map: hash table of lists
        self.memory = memory
        self.load_core_words()

    def add_word(self, word, action):
        assert isinstance(word, str) and len(word) > 0, "Dictionary word must non-empty str"
        #assert isinstance(action, (str, int, list)) or callable(action), "Dictionary action must be str, int, list, or callable"
        assert isinstance(action, (int, list)) or callable(action), "Dictionary action must be int, list, or callable"
        action_list = self.core.get(word, None)
        if action_list is None:
            self.core[word] = []
        action_address = self.memory.write(action)
        self.core[word].append(action_address)
        return action_address

    def get_action(self, word):
        assert isinstance(word, str) and len(word) > 0, "Dictionary word must non-empty str"
        action_list = self.core.get(word, None)
        memory_address = None if action_list is None else action_list[-1]
        return None if memory_address is None else self.memory.read(memory_address)

    def get_word_address(self, word):
        assert isinstance(word, str) and len(word) > 0, "Dictionary word must non-empty str"
        action_list = self.core.get(word, None)
        return None if action_list is None else action_list[-1]
        # assert isinstance(action_list, list) and len(action_list) > 0, "Definitions must not be empty"
        #return action_list[-1]

    def __divide_int(self, stack):
        a = stack.pop()
        assert isinstance(a, int), "Int / divisor must be int. Was "+ str(a)
        assert a != 0, "Divide by zero. Was "+ str(a)
        b = stack.pop()
        assert isinstance(b, int), "Int / numerator must be int. Was "+ str(b)
        stack.push(int(b / a))

    def __absolute_value(self, stack):
        a = stack.pop()
        stack.push(a if a >= 0 else -a)

    def __mod(self, stack):
        d = stack.pop()
        assert isinstance(d, int), "Modulo divisor must be int. Was "+ str(d)
        assert d != 0, "Modulo by zero. Was "+ str(d)
        n = stack.pop()
        assert isinstance(d, int), "Modulo numerator must be int. Was "+ str(d)
        d = d if d >= 0 else -d
        stack.push(n % d)

    def load_core_words(self):
        # 1 pop
        self.add_word('IF', lambda s: s.skip_condition.append(s.pop() == 0))
        #self.add_word('ELSE', lambda s: s.skip_condition[-1] = not s.skip_condition[-1])
        self.add_word('ELSE', lambda s: s.skip_condition.append( not s.skip_condition.pop()))
        self.add_word('THEN', lambda s: s.skip_condition.pop())
        self.add_word('DROP', lambda s: s.pop() )
        self.add_word('DUP', lambda s: s.push(s.peek()) )
        self.add_word('NOT', lambda s: s.push(~ s.pop()) )
        self.add_word('ABS', self.__absolute_value )
        self.add_word('=0', lambda s: s.push(1 if s.pop() == 0 else 0) )
        self.add_word('<0', lambda s: s.push(1 if s.pop() < 0 else 0) )
        self.add_word('>0', lambda s: s.push(1 if s.pop() > 0 else 0) )

        # 2 pop pops
        self.add_word('+', lambda s: s.push(s.pop() + s.pop()) )
        self.add_word('-', lambda s: s.push(s.pop(-2) - s.pop()) )
        self.add_word('*', lambda s: s.push(s.pop() * s.pop()) )
        self.add_word('/', self.__divide_int )
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
        self.add_word('MOD', self.__mod )
        self.add_word('PS', lambda s: print(s))
        self.add_word('PD', lambda s: print(self))
        self.add_word('PM', lambda s: print(self.memory))

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

