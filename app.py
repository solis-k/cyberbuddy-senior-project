from flask import Flask, render_template, request, jsonify, redirect
from openai import OpenAI
import os
import sqlite3
from dotenv import load_dotenv
from models.db import init_db, save_chat, find_exact_reply, get_recent_chats, save_quiz_result
from flask_login import UserMixin, LoginManager, login_user, logout_user, current_user, login_required
from flask_bcrypt import Bcrypt


load_dotenv()

app = Flask(__name__)

app.config["SECRET_KEY"] = "cyberbuddy-dev-key"

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


init_db()

SYSTEM_PROMPT = """
You are CyberBuddy, a fun and friendly digital buddy who helps middle school students stay safe online.

You explain things in simple language.
You are positive, encouraging, and supportive.
You use light emojis when appropriate.
You focus only on safe, defensive cybersecurity topics.
You never provide harmful or hacking instructions.
You provide guidance on:
- Phishing detection
- Password security
- Network security basics
- Ethical hacking concepts
- Cyber hygiene best practices

Do not provide illegal hacking instructions.
Focus on defensive cybersecurity education.
"""
from flask_login import login_user
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, username, password, role FROM users WHERE username=?",
            (username,)
        )

        user = cursor.fetchone()
        conn.close()

        if user and bcrypt.check_password_hash(user[2], password):
            login_user(User(user[0], user[1], user[3]))
            return redirect("/")

    return render_template("login.html")

from flask_login import logout_user

@app.route("/logout")
def logout():
    logout_user()
    return redirect("/")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/quiz")
def quiz():
    return render_template("quiz.html")

@app.route("/save_quiz_result", methods=["POST"])
@login_required
def save_quiz():
    data = request.get_json()

    score = data.get("score")
    total_questions = data.get("total_questions")

    if score is None or total_questions is None:
        return jsonify({"success": False, "error": "Missing score data"}), 400

    save_quiz_result(current_user.id, score, total_questions)

    return jsonify({"success": True})

@app.route("/chat", methods=["POST"])
@login_required
def chat():
    user_message = (request.json.get("message") or "").strip()

    if not user_message:
        return jsonify({"response": "Ask me something and I’ll help 😊"})

    user_id = current_user.id

    old_reply = find_exact_reply(user_id, user_message)
    if old_reply:
        return jsonify({"response": old_reply})

    recent_chats = get_recent_chats(user_id, limit=5)

    conversation_context = []
    for old_user_message, old_bot_response in reversed(recent_chats):
        conversation_context.append({"role": "user", "content": old_user_message})
        conversation_context.append({"role": "assistant", "content": old_bot_response})

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            *conversation_context,
            {"role": "user", "content": user_message}
        ]
    )

    bot_reply = response.choices[0].message.content

    save_chat(user_id, user_message, bot_reply)

    return jsonify({"response": bot_reply})

@login_manager.user_loader
def load_user(user_id):
    import sqlite3

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT id, username, role FROM users WHERE id=?", (user_id,))
    user = cursor.fetchone()

    conn.close()

    if user:
        return User(user[0], user[1], user[2])

    return None



if __name__ == "__main__":
    app.run(debug=True)

class User(UserMixin):
    def __init__(self, id, username, role="user"):
        self.id = id
        self.username = username
        self.role = role

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data["username"]
    password = data["password"]

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, hashed_password)
        )

        conn.commit()
        user_id = cursor.lastrowid

    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"success": False, "error": "Username already exists"})

    conn.close()

    login_user(User(user_id, username))
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True)