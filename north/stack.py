from north.util import isInt

class Stack:
    def __init__(self, initstack=None):
        if isinstance(initstack, list):
            self.stack = initstack
        elif isinstance(initstack, str):
            self.stack = initstack.split()
        else:
            self.stack = []
        self.current_index = 0

    def push(self, value):
        if value is None:
            pass
        elif isinstance(value, str) and isInt(value):
            self.stack.append(int(value))
        else:
            self.stack.append(value)

    def extend(self, list_value):
        self.stack.extend(list_value)

    def pop(self, index=-1):
        if self.is_empty():
            # TODO consider: raise ValueError("Stack empty")
            return None
        return self.stack.pop(index)

    def peek(self, index=-1):
        if self.is_empty():
            return None
            # raise ValueError("Stack is empty")
        return self.stack[index]

    def sliceFrom(self, index):
        return self.stack[index:]

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
