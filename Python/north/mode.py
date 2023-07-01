from enum import Enum


class Mode(Enum):
    EXECUTE = 1
    COMPILE = 2
    IGNORE = 3  # can be toggled with EXECUTE in same layer
    BLOCK = 4  # if parent is IGNORED then next layers are blocked
