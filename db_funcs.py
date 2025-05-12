# Imports
import pandas as pd
import firebase_admin
from firebase_admin import credentials, db
import bcrypt

# Connect to FireBase DB
cred = credentials.Certificate('credentials.json')

if not firebase_admin._apps:
    cred = credentials.Certificate('credentials.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://nature-notebook-db-default-rtdb.firebaseio.com/'
    })

# User class to store local data
class User:
    def __init__(self, user_id: int, username: str, email: str):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.settings =  self.init_setting_map() # Dict for settings
        self.permissions = set()  # Set of granted permissions

    def init_setting_map(self):
        dict = {}
        dict["light_mode"] = True
        dict["user_active"] = True
        # TO DO: add more settings
        return dict

    def update_setting(self, key: str, value):
        self.settings[key] = value

    def get_setting(self, key: str):
        return self.settings.get(key, None)

    def add_permission(self, permission: str):
        self.permissions.add(permission)

    def remove_permission(self, permission: str):
        self.permissions.discard(permission)

    def check_permission(self, permission: str) -> bool:
        return permission in self.permissions

    def __repr__(self):
        return (f"User(id={self.user_id}, username='{self.username}')")
# Clear Email of Invalid Letters
def modify(email):
    return email.replace('.', '_').replace('@','_')

#Checks if an email, checked_email, does exist
def email_exists(checked_email):
    ref = db.reference('users/')
    users = ref.get()
    if users is None:
        return False
    
    for user_data in users.values():
        if user_data.get('email') == checked_email:
            return True
    return False

# Password hashing and checking functions
def hash_pass_text(password_text):
    # First time hashing password using bcrypt; the salt is saved into the hash itself; slow hash to prevent malicious brute force attacks
    password_bytes = password_text.encode('utf-8')
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt(14))

def check_password(password_check, password_true):
    # Check hashed password
    password_check = password_check.encode('utf-8')
    password_true = password_true.encode('utf-8')
    return bcrypt.checkpw(password_check, password_true)

# Returns total user database
def get_users():
    ref = db.reference('users/')
    snapshot = ref.get()

    data = []    
    for username, user_info in snapshot.items():
        user_info['username'] = username  # Add username to the dictionary
        data.append(user_info)

    # Convert the list of dictionaries to a pandas DataFrame
    df = pd.DataFrame(data)

    columns = ['username'] + [col for col in df.columns if col != 'username'] # Rearrange columns to get username in front
    df = df[columns]

    return df # Return data

# Bit string operations for species found
def init_bitstring():
    return '0' * 200

def set_bit(bitstring, i, value):    
    lst = list(bitstring)
    lst[i - 1] = '1' if value else '0'
    return ''.join(lst)

def get_bit(bitstring: str, i: int) -> bool:    
    return bitstring[i - 1] == '1'

def get_all_true_indices(bitstring: str) -> list:
    return [(i + 1) for i, c in enumerate(bitstring) if c == '1']
# Functions to add and remove user
def add_user(username, email, password):
    ref = db.reference(f"users/{username}")  
    if ref.get() is not None: # Check if user already exists
        return 
    
    # Create user dict to push
    user = {
        'email': email,
        'password_hash' : hash_pass_text(password).decode('utf-8'),
        'is_active': True,
        'species_found' : init_bitstring()
    }
    ref.set(user)

def remove_user(username):
    ref = db.reference(f"users/{username}")  
    ref.delete()

# General getter function
def get_info(username, what):
    path_to_node = f'users/{username}/{what}'
    ref = db.reference(path_to_node)
    snapshot = ref.get()
    if snapshot is not None:    # If info exists, return it
        return snapshot

# Specific getters
def get_email(username):
    return get_info(username, 'email')

def get_species_found(username):
    return get_info(username, 'species_found')
def get_species_found_list(username):
    return get_all_true_indices(get_species_found(username))
def get_password(username):
    return get_info(username, 'password_hash')

def get_active_status(username):
    return get_info(username, 'is_active')
# Function to validate password of an user 
def validate_password(username, pass_check):
    password_hash = get_password(username)
    return check_password(pass_check, password_hash)

# Update observation helper function
def update_info(username, new_what, what): 
    ref = db.reference(f'users/{username}')  
    updates = { what : new_what } 
    ref.update(updates) # Push update

# Update observation's data functions
def update_username(username, new_username):
    update_info(username, new_username, 'user')

def update_email(username, new_email):
    update_info(username, new_email, 'email')

def update_password(username, new_pass):
    new_hash = hash_pass_text(new_pass).decode('utf-8')
    update_info(username, new_hash, 'password_hash')

def update_active(username):
    curr = get_active_status(username)
    update_info(username, not curr, 'is_active')

# Add a species id newly found by the user
def change_species_found_status(username, species_id, status):
    curr_found = get_species_found(username)
    bit = '1' if status == True else '0'
    if (get_bit(curr_found, species_id) != bit):
        curr_found = set_bit(curr_found, species_id, status)
        update_info(username, curr_found, 'species_found')

def add_species_found(username, species_id):
    print(username)
    print(species_id)
    species_label = int(species_id.split('.')[0])
    print(species_label)
    change_species_found_status(username, species_label, True)

def remove_species_found(username, species_id):
    change_species_found_status(username, species_id, False)
        
# Reset the species found by the user
def remove_all_species_found(username):
    update_info(username, init_bitstring(), 'species_found')

def username_exists(user):
    ref = db.reference(f'users/{user}')
    return ref.get() is not None

# Function to add birds to DB
def add_bird(id, name=None, description=None):
    ref = db.reference(f"birds/{id}")  
    if ref.get() is not None: # Check if bird already exists
        return 
    
    # Create bird dict to push
    birdie = {
        'name': name,
        'description' : description
    }
    
    ref.set(birdie)
    
# Get info of the birds from DB
def get_bird_info(id):
    ref = db.reference(f"birds/{id}")
    snapshot = ref.get()
    if snapshot is None:
        return {"error": "Bird not found"}
    return snapshot