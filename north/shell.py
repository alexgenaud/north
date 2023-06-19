from north.interpreter import Interpreter

class Shell:
    def __init__(self):
        self.interpreter = Interpreter()
        self.running = False

    def run(self):
        self.running = True
        print("Welcome to North, the Forth from the North, interactive shell! (type 'quit' to quit)")
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
    import sys
    interpreter = Interpreter()
    if len(sys.argv) <= 1 and sys.stdin.isatty():
        #shell = Shell()
        #shell.run()
        print("Welcome to North, the Forth from the North, interactive shell! (type 'quit' to quit)")
        for line in sys.stdin:
            line = line.strip()
            if line == "quit":
                break
            interpreter.execute(line)
            print(interpreter.stack)
        sys.exit(0)
    if not sys.stdin.isatty():
        for line in sys.stdin:
            line = line.strip()
            interpreter.execute(line)
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            interpreter.execute(arg)
    print(interpreter.stack)
    sys.exit(0)

