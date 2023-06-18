from north.dictionary import Dictionary
from north.stack import Stack
from north.util import isInt

class Interpreter:
    def __init__(self, dictionary=None, stack=None):
        self.dictionary = Dictionary() if dictionary is None else dictionary
        self.stack = Stack() if stack is None else stack
        self.errors = Stack()

    def execute(self, string_input):
        if not string_input or not string_input.strip():
            return
        tokens = string_input.split()
        definition = None # may be [] list, for new definitions
        skip_condition = []
        for token in tokens:
            if token == ':': # begin definition
                definition = []
            elif definition is not None:
                if token == ';': # end definition
                    def_name = definition.pop(0)
                    compiled = ' '.join(definition)
                    self.dictionary.add_word(def_name, compiled)
                    definition = None
                else:
                    definition.append(token)

            elif token == 'IF':
                skip_condition.append(self.stack.pop() == 0)
            elif token == 'ELSE':
                skip_condition[-1] = not skip_condition[-1]
            elif token == 'THEN':
                skip_condition.pop()
            elif skip_condition and skip_condition[-1]:
                continue

            elif isInt(token):
                self.stack.push(token)
            else: # is string
                action = self.dictionary.get_action(token)
                if action is None:
                    self.errors.push("Unknown word: " + token)
                    self.stack.push(token) # unknown token
                elif callable(action):
                    action(self.stack)
                elif isinstance(action, str):
                    self.execute(action)
                else:
                    self.errors.push("Unexpected word type: " + token)
                    self.stack.push(token) # action or token?


    def run(self):
        self.load_core_words()
        input_string = input("Enter North program: ")
        self.execute(input_string)
        print("Stack:", self.stack.get_elements())

    if __name__ == '__main__':
        interpreter = Interpreter()
        interpreter.run()
