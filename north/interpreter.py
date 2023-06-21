from north.dictionary import Dictionary
from north.stack import Stack
from north.memory import Memory
from north.util import isInt

class Interpreter:
    def __init__(self, dictionary=None, stack=None, memory=None):
        self.memory = Memory() if memory is None else memory
        self.dictionary = Dictionary(self.memory) if dictionary is None else dictionary
        self.stack = Stack() if stack is None else stack

    def compile_colon_word(self, definition_str_list):
        word_name = definition_str_list.pop(0)
        address_list = []
        for token in definition_str_list:
            assert token is not None and len(token) > 0, "Compiled colon word must contain non-empty int or words"
            address = self.dictionary.get_word_address(token)
            if address is None and isInt(token):
                address = self.dictionary.add_word(str(token), int(token))
                address_list.append(int(address))
                continue;

            assert isinstance(address, int), "Extant action must have memory address"
            action = self.dictionary.get_action(token)
            assert isinstance(action, (int, list)) or callable(action), "Word `"+ token +"` action must be int, list, or call"
            if callable(action):
                address_list.append(int(address))
            elif isinstance(action, int): # new mutable constant int
                address_list.append(int(address))
            elif isinstance(action, list): # comp word list of addresses
                # FIXME Somehow determine INLINE or SUBROUTINE
                # TODO in-line by extending this function with elements from list
                address_list.extend(action);

                # TODO sub-routing by referencing list by `address` then must recurse when a list is found
                #address_list.append(int(address))
        self.dictionary.add_word(word_name, address_list)

    def execute_colon_word(self, address_list):
        for address in address_list:
            if address != 0 and address != 1 and address != 2 and self.stack.skip_condition and self.stack.skip_condition[-1]:
                # FIXME TODO these are hard coded dictionary memory addresses for IF, ELSE, THEN
                continue

            assert isinstance(address, int), "Executed colon word address: " + address +" must be int"
            value = self.memory.read(address);
            assert value is not None, "Value at address: "+ address +" must exist in memory"

            if callable(value):
                value(self.stack)
            elif isinstance(value, int):
                self.stack.push(int(value))
            elif isinstance(value, list):
                self.execute_colon_word(value)

    def execute(self, string_input):
        if not string_input or not string_input.strip():
            return
        tokens = string_input.split()
        definition = None # may be [] list, for new definitions
        for token in tokens:
            if token != "IF" and token != "ELSE" and token != "THEN" and self.stack.skip_condition and self.stack.skip_condition[-1]:
                # FIXME TODO these are hard coded dictionary memory addresses for IF, ELSE, THEN
                continue
            elif token == ':': # begin definition
                definition = []
                continue;
            elif definition is not None:
                if token == ';': # end definition
                    self.compile_colon_word(definition)
                    definition = None
                else:
                    definition.append(token)
                continue;

            action = self.dictionary.get_action(token)
            assert isinstance(action, list) or isInt(token) or callable(action), "Tokens are either callable code word, list colon word, or int"
            if callable(action):
                action(self.stack)
            elif isinstance(action, list):
                self.execute_colon_word(action) 
            elif isInt(token):
                self.stack.push(token)
