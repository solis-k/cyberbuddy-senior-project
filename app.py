from flask import Flask, render_template, request, jsonify, redirect, abort
from openai import OpenAI
import os
import sqlite3
from dotenv import load_dotenv
from models.db import (
    init_db,
    save_chat,
    find_exact_reply,
    get_recent_chats,
    save_quiz_result,
    get_all_users,
    get_all_chat_history,
    get_all_quiz_results,
    get_quiz_leaderboard
)
from flask_login import UserMixin, LoginManager, login_user, logout_user, current_user, login_required
from flask_bcrypt import Bcrypt

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev_secret")

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

init_db()

SYSTEM_PROMPT = """
You are CyberBuddy, a fun and friendly digital buddy who helps middle school students stay safe online.

PERSONALITY:
- You explain things in simple language.
- You are positive, encouraging, and supportive.
- You use light emojis when appropriate.
- You focus only on safe, defensive cybersecurity topics.
- You never provide harmful or hacking instructions.

TOPICS:
Only answer questions related to:
- Phishing
- Password safety
- Virus protection
- Social media safety
- Data privacy
- AI safety

RESPONSE RULES:
- Always respond in SHORT answers (1–2 sentences max for definitions)
- Keep language simple and beginner-friendly
- Do NOT give long paragraphs

CONVERSATION FLOW:
1. FIRST RESPONSE:
- Give a short definition (1–2 sentences max)
- Then ask: "Do you want to learn more? (yes/no)"

2. IF USER SAYS "YES":
- Give EXACTLY 3 short bullet points using "-" format
- Then ask: "Do you want tips? (yes/no)"

3. IF USER SAYS "YES" AGAIN:
- Give EXACTLY 1 helpful tip (1–2 sentences max)
- Then say: "Ask me something else!"

4. IF USER SAYS "NO" AT ANY POINT:
- Respond ONLY with: "No problem! Ask me something else 😊"
- Do NOT continue the topic

FORMATTING RULES:
- Use "-" for bullet points (example:
  - Point 1
  - Point 2
  - Point 3)
- Keep responses short and structured
- Do NOT combine steps
- Do NOT skip steps

Always follow the flow
Do not provide illegal hacking instructions.
Focus on defensive cybersecurity education.
"""

bcrypt = Bcrypt(app)


class User(UserMixin):
    def __init__(self, id, username, name="", role="user"):
        self.id = id
        self.username = username
        self.name = name
        self.role = role


@login_manager.user_loader
def load_user(user_id):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT id, username, name, role FROM users WHERE id=?",
            (user_id,)
        )
        user = cursor.fetchone()
    except sqlite3.OperationalError:
        cursor.execute(
            "SELECT id, username, role FROM users WHERE id=?",
            (user_id,)
        )
        user = cursor.fetchone()
        conn.close()

        if user:
            return User(user[0], user[1], "", user[2])
        return None

    conn.close()

    if user:
        return User(user[0], user[1], user[2], user[3])

    return None


@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "No data"}), 400

        username = data.get("username")
        password = data.get("password")

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        try:
            cursor.execute(
                "SELECT id, username, password, name, role FROM users WHERE username=?",
                (username,)
            )
            user = cursor.fetchone()
            conn.close()

            if not user:
                return jsonify({"success": False, "error": "User not found"})

            if bcrypt.check_password_hash(user[2], password):
                login_user(User(user[0], user[1], user[3], user[4]))
                return jsonify({"success": True})

            return jsonify({"success": False, "error": "Wrong password"})

        except sqlite3.OperationalError:
            cursor.execute(
                "SELECT id, username, password, role FROM users WHERE username=?",
                (username,)
            )
            user = cursor.fetchone()
            conn.close()

            if not user:
                return jsonify({"success": False, "error": "User not found"})

            if bcrypt.check_password_hash(user[2], password):
                login_user(User(user[0], user[1], "", user[3]))
                return jsonify({"success": True})

            return jsonify({"success": False, "error": "Wrong password"})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True})


@app.route("/")
def home():
    if current_user.is_authenticated:
        display_name = "Admin" if current_user.role == "admin" else current_user.name
    else:
        display_name = None

    return render_template("index.html", name=display_name)


@app.route("/quiz")
def quiz():
    return render_template("quiz.html")

@app.route("/leaderboard-data")
def leaderboard_data():
    leaderboard = get_quiz_leaderboard()
    return jsonify({"leaderboard": leaderboard})

@app.route("/admin")
@login_required
def admin_dashboard():
    # 🔒 Only admin can access
    if current_user.role != "admin":
        return "Access denied", 403

    users = get_all_users()
    chats = get_all_chat_history()
    quiz_results = get_all_quiz_results()

    return render_template(
        "admin.html",
        users=users,
        chats=chats,
        quiz_results=quiz_results
    )


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
def chat():
    user_message = (request.json.get("message") or "").strip()

    if not user_message:
        return jsonify({"response": "Ask me something and I’ll help 😊"})

    user_id = current_user.id if current_user.is_authenticated else None

    old_reply = find_exact_reply(user_id, user_message) if user_id else None
    if old_reply:
        return jsonify({"response": old_reply})

    recent_chats = get_recent_chats(user_id, limit=5) if user_id else []

    conversation_context = []
    for old_user_message, old_bot_response in reversed(recent_chats):
        conversation_context.append({"role": "user", "content": old_user_message})
        conversation_context.append({"role": "assistant", "content": old_bot_response})

    knowledge = get_relevant_knowledge(user_message)

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT + "\n\nUse this knowledge:\n" + knowledge
            },
            *conversation_context,
            {"role": "user", "content": user_message}
        ]
    )

    bot_reply = response.choices[0].message.content

    if user_id:
        save_chat(user_id, user_message, bot_reply)

    return jsonify({"response": bot_reply})


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")
    name = data.get("name", "")

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, password, name) VALUES (?, ?, ?)",
            (username, hashed_password, name)
        )
        conn.commit()
        user_id = cursor.lastrowid
    except sqlite3.OperationalError:
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

    login_user(User(user_id, username, name, "user"))
    return jsonify({"success": True})


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

    elif any(word in user_message for word in ["ai", "artificial intelligence", "chatbot", "robot"]):
        file = "knowledge_base/ai.txt"

    else:
        file = "knowledge_base/browsing.txt"

    with open(file, "r", encoding="utf-8") as f:
        return f.read()
    
@app.route("/delete_user/<int:user_id>", methods=["POST"])
@login_required
def delete_user(user_id):
    if current_user.role != "admin":
        return "Unauthorized", 403

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM users WHERE id=?", (user_id,))
    conn.commit()
    conn.close()

    return jsonify({"success": True})

@app.route("/clear_chats", methods=["POST"])
@login_required
def clear_chats():
    if current_user.role != "admin":
        return "Unauthorized", 403

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM chat_history")
    conn.commit()
    conn.close()

    return jsonify({"success": True})

@app.route("/promote_user/<int:user_id>", methods=["POST"])
@login_required
def promote_user(user_id):
    if current_user.role != "admin":
        return "Unauthorized", 403

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("UPDATE users SET role='admin' WHERE id=?", (user_id,))
    conn.commit()
    conn.close()

    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(debug=True)
