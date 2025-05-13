from flask import Blueprint, redirect, url_for, session, jsonify
from authlib.integrations.flask_client import OAuth
import os
import secrets
from db_funcs import add_user, email_exists

oauth_blueprint = Blueprint('oauth', __name__)
oauth = OAuth()
google_oauth = None

def init_oauth(app):
    global google_oauth
    oauth.init_app(app)
    google_oauth = oauth.register(
        name = 'google',
        client_id = os.getenv("GOOGLE_CLIENT_ID"),
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET"),
#        authorize_url ='https://accounts.google.com/o/oauth2/auth',
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'},
    )

@oauth_blueprint.route('/login')
def login():
   nonce = secrets.token_urlsafe(16)
   session['auth_nonce'] = nonce
   redirect_url =  url_for('oauth.authorize', _external = True)
   return google_oauth.authorize_redirect(redirect_url, nonce=nonce)

@oauth_blueprint.route('/authorize')
def authorize():
    token = google_oauth.authorize_access_token()

    nonce = session.pop('auth_nonce', None)
    if nonce is None:
        return jsonify({"error": "Missing nonce"}), 400
    
    user_info = google_oauth.parse_id_token(token, nonce=nonce)
    session['user'] = user_info
    
    email = user_info['email']
    username = email.replace('.', '_').replace('@', '_')

    if(email_exists(email)):
        return redirect('/')
    if not email_exists(email):
        return redirect(f'/add-user?email={email}')
    return redirect('/')

@oauth_blueprint.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('/')