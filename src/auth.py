"""
OAuth login blueprint

- Integrates Google OAuth using Authlib
- Handles login, logout, and token-based user session
- Checks if user exists in Firebase and redirects accordingly
"""


from flask import Blueprint, redirect, url_for, session, jsonify
from authlib.integrations.flask_client import OAuth
import os
import secrets
from db_funcs import add_user, email_exists

# Create a Flask blueprint for OAuth-related routes
oauth_blueprint = Blueprint('oauth', __name__)
oauth = OAuth()
google_oauth = None

# Initialize OAuth with Google provider
def init_oauth(app):
    global google_oauth
    oauth.init_app(app)
    google_oauth = oauth.register(
        name = 'google',
        client_id = os.getenv("GOOGLE_CLIENT_ID"),
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET"),
#        authorize_url ='https://accounts.google.com/o/oauth2/auth',
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'}, # Request email and profile info
    )

# Route to begin Google OAuth login flow
@oauth_blueprint.route('/login')
def login():
   nonce = secrets.token_urlsafe(16) # Random nonce to prevent replay attacks
   session['auth_nonce'] = nonce
   redirect_url =  url_for('oauth.authorize', _external = True)
   return google_oauth.authorize_redirect(redirect_url, nonce=nonce)

# Callback route for Google to redirect to after user logs in
@oauth_blueprint.route('/authorize')
def authorize():
    token = google_oauth.authorize_access_token()

    nonce = session.pop('auth_nonce', None)
    if nonce is None:
        return jsonify({"error": "Missing nonce"}), 400
    
    user_info = google_oauth.parse_id_token(token, nonce=nonce)
    session['user'] = user_info # Store user info in session
    
    email = user_info['email']

    if(email_exists(email)):
        return redirect('/') # Existing user goes to home
    if not email_exists(email):
        return redirect(f'/add-user?email={email}') # New user is redirected to sign-up
    return redirect('/')

# Route to log the user out
@oauth_blueprint.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('/')