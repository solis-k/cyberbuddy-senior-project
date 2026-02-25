from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
client = OpenAI(api_key=os.getenv("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"))

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json["message"]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful cybersecurity assistant."},
            {"role": "user", "content": user_message}
        ]
    )

    return jsonify({
        "response": response.choices[0].message.content
    })

if __name__ == "__main__":
    app.run(debug=True)