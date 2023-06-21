class Memory:

    def __init__(self, size=None):
        self.size = 42 if size is None else size
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
        memory_str = ""
        for address, value in enumerate(self.memory):
            if isinstance(value, str):
                memory_str += f"{address}: {value}\n"
            elif isinstance(value, int):
                memory_str += f"{address}: {value}\n"
            elif callable(value):
                memory_str += f"{address}: call\n"
            else:
                memory_str += f"{address}: {type(value).__name__}\n"
        return memory_str

