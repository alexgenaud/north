from north.interpreter import Interpreter

if __name__ == "__main__":
    """
    North Forth Interpreter - Main Entry Point

    This script serves as the main entry point for running the North Forth interpreter.
    It accepts input from various sources and executes the Forth commands using the Interpreter class.

    Usage:
        python main.py                                               # Interactive shell mode
        python main.py command1 command2                             # Execute multiple commands
        echo "command1 command2" | python main.py command3 command4  # Execute stdin pipe and multiple commands

        TODO python main.py script.fs          # Execute commands from a file TODO

    If no arguments are provided and the standard input is a terminal, it enters interactive shell mode.

    In interactive shell mode, the user can enter Forth commands line by line.
    Entering 'quit' will exit the shell.

    When multiple commands are provided as arguments, it executes them sequentially.

    # TODO When a file is provided as an argument, it executes the Forth commands from the file.

    After executing the commands, it prints the current state of the stack.
    """
    import sys
    interpreter = Interpreter()
    if len(sys.argv) <= 1 and sys.stdin.isatty():
        # Interactive shell mode
        print("Welcome to North, the Forth from the North, interactive shell! (type 'quit' to quit)")
        try:
            for line in sys.stdin:
                line = line.strip()
                if line.lower() == "quit":
                    sys.exit(0)
                interpreter.execute(line)
        except KeyboardInterrupt:
            print("\nKeyboardInterrupt: Exiting...")
            sys.exit(1)

    if not sys.stdin.isatty():
        # Execute commands from standard input
        for line in sys.stdin:
            line = line.strip()
            interpreter.execute(line)
    if len(sys.argv) > 1:
        # Execute commands from command-line arguments
        for arg in sys.argv[1:]:
            interpreter.execute(arg)
    print(interpreter.stack)
    sys.exit(0)
