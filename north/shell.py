from north.interpreter import Interpreter

class Shell:
    def __init__(self):
        self.interpreter = Interpreter()
        self.running = False

    def run(self):
        self.running = True
        print("Welcome to North shell, the Forth from the North! (type 'quit' to quit)")
        while self.running:
            command = input("")
            self.execute_command(command)

    def execute_command(self, command):
        if command.lower() == "quit":
            self.running = False
        else:
            self.interpreter.execute(command)
            self.display_stack()

    def display_stack(self):
        print("Stack:", self.interpreter.stack)

if __name__ == "__main__":
    shell = Shell()
    shell.run()
