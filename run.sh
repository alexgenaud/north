if [ -z "$1" ]; then # no input arguments
    python3 -m north.shell
elif [ "_$1" = "_tests" -o "_$1" = "_tests/" -o "_$1" = "\.y" ]; then
    echo "Running all tests in tests/"
    python3 -m unittest discover -s tests -p "*_test.py"
else
    echo "Running tests in tests/ matching:{$1}:"
    python3 -m unittest discover -s tests -p "*_test.py" -k "$1"
fi
