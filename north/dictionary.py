from north.mode import Mode
from north.util import isInt


class Dictionary:
    def __init__(self, memory):
        self.core = {}  # collision map: hash table of lists
        self.memory = memory
        self.load_core_words()

    def add_word(self, word, action):
        assert isinstance(word, str) and len(word) > 0, "Dictionary word must be non-empty str"
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
        assert isinstance(word, str) and len(word) > 0, "Dictionary word must be non-empty str"
        action_list = self.core.get(word, None)
        return None if action_list is None else action_list[-1]

    def __divide_int(self, stack):
        a = stack.pop()
        assert isinstance(a, int), "Int / divisor must be int. Was " + str(a)
        assert a != 0, "Divide by zero. Was " + str(a)
        b = stack.pop()
        assert isinstance(b, int), "Int / numerator must be int. Was " + str(b)
        stack.push(int(b / a))

    def __absolute_value(self, stack):
        a = stack.pop()
        stack.push(a if a >= 0 else -a)

    def __mod(self, stack):
        d = stack.pop()
        assert isinstance(d, int), "Modulo divisor must be int. Was " + str(d)
        assert d != 0, "Modulo by zero. Was " + str(d)
        n = stack.pop()
        assert isinstance(d, int), "Modulo numerator must be int. Was " + str(d)
        d = d if d >= 0 else -d
        stack.push(n % d)

    def __compile_start(self, stack):
        assert stack.modePeek() == Mode.EXECUTE and stack.compile_definition is None, "Start compilation from EXECUTE mode with no definition list"
        stack.modePush(Mode.COMPILE)
        stack.compile_definition = []

    def __compile_end(self, stack):
        assert stack.modePeek() == Mode.COMPILE and isinstance(stack.compile_definition, list), "End compilation in COMPILE mode with a definition list"
        word_name = stack.compile_definition.pop(0)
        address_list = []
        for token in stack.compile_definition:
            assert token is not None and len(token) > 0, "Compiled colon word must contain non-empty int or words"
            address = self.get_word_address(token)
            if address is None and isInt(token):
                address = self.add_word(str(token), int(token))
                address_list.append(int(address))
                continue

            assert isinstance(address, int), "Extant action must have memory address"
            action = self.get_action(token)
            assert isinstance(action, (int, list)) or callable(action), "Word `" + token + "` action must be int, list, or call"
            if callable(action):
                address_list.append(int(address))
            elif isinstance(action, int):  # new mutable constant int
                address_list.append(int(address))
            elif isinstance(action, list):  # comp word list of addresses
                # address_list.append(int(address)) # SUBROUTINE
                address_list.extend(action)  # INLINE
        address = self.add_word(word_name, address_list)
        stack.compile_definition = None
        stack.modePop()
        assert stack.modePeek() == Mode.EXECUTE, "Expect to pop out of COMPILE into EXECUTE mode"

    def __condition_if(self, stack):
        current = stack.modePeek()
        if current in (Mode.IGNORE, Mode.BLOCK):
            stack.modePush(Mode.BLOCK)
        elif current == Mode.COMPILE:
            stack.modePush(Mode.COMPILE)
        elif current == Mode.EXECUTE:
            stack.modePush(Mode.EXECUTE if stack.pop() != 0 else Mode.IGNORE)

    def __condition_else(self, stack):
        current = stack.modePeek()
        if current == Mode.IGNORE:
            stack.modeToggle(Mode.EXECUTE)
        elif current == Mode.EXECUTE:
            stack.modeToggle(Mode.IGNORE)

    def __condition_then(self, stack):
        assert (stack.modePeek() != Mode.COMPILE), "Executed condition must be from EXECUTE or IGNORE but not COMPILE mode"
        stack.modePop()  # if EXECUTE else IGNORE else EXECUTE

    def load_core_words(self):
        # 1 pop
        self.add_word('IF', self.__condition_if)
        self.add_word('ELSE', self.__condition_else)
        self.add_word('THEN', self.__condition_then)
        self.add_word(':', self.__compile_start)
        self.add_word(';', self.__compile_end)
        self.add_word('DROP', lambda s: s.pop())
        self.add_word('DUP', lambda s: s.push(s.peek()))
        self.add_word('NOT', lambda s: s.push(~ s.pop()))
        self.add_word('ABS', self.__absolute_value)
        self.add_word('=0', lambda s: s.push(1 if s.pop() == 0 else 0))
        self.add_word('<0', lambda s: s.push(1 if s.pop() < 0 else 0))
        self.add_word('>0', lambda s: s.push(1 if s.pop() > 0 else 0))

        # 0 no pops
        self.add_word('PS', lambda s: print(s))
        self.add_word('PD', lambda s: print(self))
        self.add_word('PM', lambda s: print(self.memory))

        # 2 pop pops
        self.add_word('+', lambda s: s.push(s.pop() + s.pop()))
        self.add_word('-', lambda s: s.push(s.pop(-2) - s.pop()))
        self.add_word('*', lambda s: s.push(s.pop() * s.pop()))
        self.add_word('/', self.__divide_int)
        self.add_word('=', lambda s: s.push(1 if s.pop() == s.pop() else 0))
        self.add_word('<', lambda s: s.push(1 if s.pop() > s.pop() else 0))
        self.add_word('>', lambda s: s.push(1 if s.pop() < s.pop() else 0))
        self.add_word('OVER', lambda s: s.push(s.peek(-2)))
        self.add_word('SWAP', lambda s: s.push(s.pop(-2)))
        self.add_word('AND', lambda s: s.push(s.pop() & s.pop()))
        self.add_word('OR', lambda s: s.push(s.pop() | s.pop()))
        self.add_word('XOR', lambda s: s.push(s.pop() ^ s.pop()))
        self.add_word('<=0', lambda s: s.push(1 if s.pop() <= 0 else 0))
        self.add_word('>=0', lambda s: s.push(1 if s.pop() >= 0 else 0))
        self.add_word('MOD', self.__mod)

        # 3 pop pop pops
        self.add_word('ROT', lambda s: s.push(s.pop(-3)))

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
