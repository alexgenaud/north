def isInt(token):
    return token.isdigit() or (
            token.startswith('-') and token[1:].isdigit())
