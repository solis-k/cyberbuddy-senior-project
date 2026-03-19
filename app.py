from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv
from models.db import init_db, save_chat, find_exact_reply
from flask_login import UserMixin
from flask_login import LoginManager
from flask_login import login_user
from flask_login import logout_user
import sqlite3
from flask_login import current_user

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev_secret")

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

Try to give short responses with follow up questions to keep the user interested.
Always prioritize the knowledge base to avoid guessing.
"""

from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        print("DATA:", data)

        if not data:
            return jsonify({"success": False, "error": "No data"}), 400

        name = data.get("name")
        username = data.get("username")
        password = data.get("password")

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, username, password, name, role FROM users WHERE username=?",
            (username,)
        )

        user = cursor.fetchone()
        conn.close()

        print("USER:", user)

        if not user:
            return jsonify({"success": False, "error": "User not found"})

        stored_password = user[2]

        # 🔑 IMPORTANT FIX
        if bcrypt.check_password_hash(stored_password, password):
            login_user(User(user[0], user[1], user[3], user[4]))
            return jsonify({"success": True})

        return jsonify({"success": False, "error": "Wrong password"})

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/logout")
def logout():
    logout_user()
    return redirect("/")

@app.route("/")
def home():
    if current_user.is_authenticated:
        name = current_user.name
    else:
        name = None

    return render_template("index.html", name=name)

@app.route("/quiz")
def quiz():
    return render_template("quiz.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = (request.json.get("message") or "").strip()

    if not user_message:
        return jsonify({"response": "Ask me something and I’ll help 😊"})

    #Check database first
    old_reply = find_exact_reply(user_message)
    if old_reply:
        return jsonify({"response": old_reply})

    #load from knowledge base
    knowledge = get_relevant_knowledge(user_message)

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT + "\n\nUse this knowledge:\n" + knowledge
            },
            {"role": "user", "content": user_message}
        ]
    )

    bot_reply = response.choices[0].message.content

    # 3️⃣ Save new answer
    save_chat(user_message, bot_reply)

    return jsonify({"response": bot_reply})

@login_manager.user_loader
def load_user(user_id):
    import sqlite3

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, username, name, role FROM users WHERE id=?",
        (user_id,)
    )

    user = cursor.fetchone()
    conn.close()

    if user:
        return User(user[0], user[1], user[2], user[3])  # ✅ FIXED

    return None



if __name__ == "__main__":
    app.run(debug=True)

class User(UserMixin):
    def __init__(self, id, username, name, role):
        self.id = id
        self.username = username
        self.name = name
        self.role = role

@app.route("/register", methods=["POST"])
def register():
    try:
        print("REGISTER HIT")

        data = request.get_json()
        print("DATA:", data)

        name = data["name"]
        username = data["username"]
        password = data["password"]

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO users (username, password, name) VALUES (?, ?, ?)",
            (username, hashed_password, name)
        )

        conn.commit()
        conn.close()

        return jsonify({"success": True})

    except Exception as e:
        print("ERROR:", str(e))  # 👈 THIS IS KEY
        return jsonify({"success": False, "error": str(e)})

def get_relevant_knowledge(user_message):
    user_message = user_message.lower()

    if any(word in user_message for word in ["phish", "email scam", "fake email", "scam"]):
        file = "knowledge_base/phishing.txt"

    elif any(word in user_message for word in ["password", "login", "credentials"]):
        file = "knowledge_base/passwords.txt"

    elif any(word in user_message for word in ["browse", "website", "link", "internet"]):
        file = "knowledge_base/browsing.txt"

    elif any(word in user_message for word in ["social", "instagram", "snapchat", "tiktok"]):
        file = "knowledge_base/social.txt"

    elif any(word in user_message for word in ["virus", "malware", "download"]):
        file = "knowledge_base/malware.txt"

    elif any(word in user_message for word in ["privacy", "data", "information"]):
        file = "knowledge_base/privacy.txt"

    else:
        # fallback (general cybersecurity info)
        file = "knowledge_base/browsing.txt"

    with open(file, "r", encoding="utf-8") as f:
        return f.read()