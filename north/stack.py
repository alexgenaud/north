from north.util import isInt
from north.mode import Mode


class Stack:
    def __init__(self, initstack=None):
        if isinstance(initstack, list):
            self.stack = initstack
        elif isinstance(initstack, str):
            self.stack = initstack.split()
        else:
            self.stack = []
        self.current_index = 0
        self.skip_condition = []
        self.mode = [Mode.EXECUTE]
        self.compile_definition = None  # A list when in COMPILE mode

    def modePeek(self, index=-1):
        assert len(self.mode) > 0, "Mode stack must have enums to peek"
        return self.mode[index]

    def modePop(self, index=-1):
        assert len(self.mode) > 0, "Mode stack must have enums to peek"
        return self.mode.pop(index)

    def modePush(self, mode):
        assert isinstance(mode, Mode), "Mode stack must only contain Mode enums"
        self.mode.append(mode)

    def modeToggle(self, next):
        assert isinstance(next, Mode), "Must set transition mode"
        self.mode[-1] = next

    def push(self, value):
        assert isinstance(value, (int, str)), "Stack token must be str or int"
        if isinstance(value, str) and isInt(value):
            self.stack.append(int(value))
        else:
            self.stack.append(value)

    def extend(self, list_value):
        assert isinstance(list_value, list), "Extend stack with list only"
        self.stack.extend(list_value)

    def pop(self, index=-1):
        assert len(self.stack) > 0, "Stack must have tokens to pop"
        return self.stack.pop(index)

    def peek(self, index=-1):
        assert len(self.stack) > 0, "Stack must have tokens to peek"
        return self.stack[index]

    def is_empty(self):
        return len(self.stack) == 0

    def __len__(self):
        return len(self.stack)

    def __str__(self):
        return ' '.join(str(item) for item in self.stack)

    def __iter__(self):
        self.current_index = 0
        return self

    def __next__(self):
        if self.current_index < len(self.stack):
            value = self.stack[self.current_index]
            self.current_index += 1
            return value
        else:
            raise StopIteration
