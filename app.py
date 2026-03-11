from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv
from models.db import init_db, save_chat, find_exact_reply

load_dotenv()

app = Flask(__name__)
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

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/quiz")
def quiz():
    return render_template("quiz.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = (request.json.get("message") or "").strip()

    if not user_message:
        return jsonify({"response": "Ask me something and I’ll help 😊"})

    # 1️⃣ Check database first
    old_reply = find_exact_reply(user_message)
    if old_reply:
        return jsonify({"response": old_reply})

    # 2️⃣ Otherwise call OpenAI
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
    )

    bot_reply = response.choices[0].message.content

    # 3️⃣ Save new answer
    save_chat(user_message, bot_reply)

    return jsonify({"response": bot_reply})

if __name__ == "__main__":
    app.run(debug=True)
