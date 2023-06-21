def isInt(token):
    if isinstance(token, int):
        return True
    if not isinstance(token, str):
        return False
    if token.isdigit() or (token.startswith('-') and token[1:].isdigit()):
        return True
    return False
