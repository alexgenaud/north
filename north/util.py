def isInt(token):
    return True if token.isdigit() or (
            token.startswith('-') and token[1:].isdigit()
        ) else False
