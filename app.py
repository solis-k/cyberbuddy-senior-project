from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv
from models.db import init_db, save_chat


load_dotenv()

app = Flask(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

init_db()

SYSTEM_PROMPT = """
You are CyberBuddy, a cybersecurity assistant.
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

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json["message"]

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
    )

    bot_reply = response.choices[0].message.content

    save_chat(user_message, bot_reply)

    return jsonify({"response": bot_reply})

if __name__ == "__main__":
    app.run(debug=True)