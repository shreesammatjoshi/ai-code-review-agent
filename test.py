#testing security scanner semgrep

password = "supersecret123"
api_key = "abc123xyz"

def login(user_input):
    eval(user_input)
    
def get_user(id):
    query = "SELECT * FROM users WHERE id = " + id
    return query
