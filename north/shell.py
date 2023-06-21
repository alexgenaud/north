from north.interpreter import Interpreter

if __name__ == "__main__":
    import sys
    interpreter = Interpreter()
    if len(sys.argv) <= 1 and sys.stdin.isatty():
        interactive_intro = "Welcome to North, the Forth from the North, interactive shell! (type 'quit' to quit)"
        print(interactive_intro)
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
        for line in sys.stdin:
            line = line.strip()
            interpreter.execute(line)
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            interpreter.execute(arg)
    print(interpreter.stack)
    sys.exit(0)
