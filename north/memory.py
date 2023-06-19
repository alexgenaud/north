class Memory:

    def __init__(self, size=None):
        self.size = 32 if size is None else size
        self.memory = [0] * self.size
        self.highest_address = -1

    def read(self, address):
        assert isinstance(address, int), "Memory address must be int"
        assert address >= 0, "Illegal memory address less than zero: {}".format(address)
        assert address < len(self.memory), "Memory address out of bounds: {}".format(address)
        return self.memory[address]

    def write(self, value, address=None):
        if address is None:
            address = self.highest_address = self.highest_address + 1
        elif address > self.highest_address:
            self.highest_address = address

        assert isinstance(address, int), "Memory address must be int"
        assert address >= 0, "Illegal memory address less than zero: {}".format(address)
        assert address < len(self.memory), "Memory address out of bounds: {}".format(address)

        self.memory[address] = value
        return address

    def __str__(self):
        indent = ''
        result = ''
        for key, value in self.memory.items():
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
