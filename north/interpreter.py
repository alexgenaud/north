from north.dictionary import Dictionary
from north.memory import Memory
from north.mode import Mode
from north.stack import Stack
from north.util import isInt


class Interpreter:
    def __init__(self, dictionary=None, stack=None, memory=None):
        """
        Initializes the Interpreter.

        Args:
            dictionary (Dictionary, optional): The dictionary to use. Defaults to None.
            stack (Stack, optional): The stack to use. Defaults to None.
            memory (Memory, optional): The memory to use. Defaults to None.
        """
        self.memory = Memory() if memory is None else memory
        self.dictionary = Dictionary(self.memory) if dictionary is None else dictionary
        self.stack = Stack() if stack is None else stack

    def execute_colon_word(self, address_list):
        """
        Executes a colon word definition.

        Args:
            address_list (list): The list of addresses representing the colon word definition.
        """
        MEM_0_IF = 0
        MEM_1_ELSE = 1
        MEM_2_THEN = 2
        for address in address_list:
            if self.stack.modePeek() in (Mode.IGNORE, Mode.BLOCK) and address not in (MEM_0_IF, MEM_1_ELSE, MEM_2_THEN):
                continue

            assert isinstance(address, int), "Executed colon word address: " + address + " must be int"
            value = self.memory.read(address)
            assert value is not None, "Value at address: " + address + " must exist in memory"

            if callable(value):
                value(self.stack)
            elif isinstance(value, int):
                self.stack.push(int(value))
            elif isinstance(value, list):
                self.execute_colon_word(value)

    def execute(self, string_input):
        """
        Executes the given string input.

        Args:
            string_input (str): The string input to execute.
        """
        if not string_input or not string_input.strip():
            return
        for token in string_input.split():
            if self.stack.modePeek() == Mode.EXECUTE or (
                    self.stack.modePeek() == Mode.COMPILE and token == ";") or (
                    self.stack.modePeek() in (Mode.IGNORE, Mode.BLOCK) and token in ("IF", "ELSE", "THEN")):
                action = self.dictionary.get_action(token)
                assert isinstance(action, list) or isInt(token) or callable(action), "Tokens are either callable code word, list colon word, or int"
                if callable(action):
                    action(self.stack)
                elif isinstance(action, list):
                    self.execute_colon_word(action)
                elif isInt(token):
                    self.stack.push(token)
            elif self.stack.modePeek() == Mode.COMPILE:
                self.stack.compile_definition.append(token)
            elif self.stack.modePeek() == Mode.IGNORE:
                continue
            else:
                assert False, "Unknown mode state: " + self.stack.modePeek() + " all mode stack: " + str(self.stack.mode)
