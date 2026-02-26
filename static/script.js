async function sendMessage() {
    const inputField = document.getElementById("userInput");
    const message = inputField.value;

    if (!message) return;

    const chatbox = document.getElementById("chatbox");

    chatbox.innerHTML += `
        <div class="user">
            <div class="bubble">${message}</div>
        </div>
    `;

    inputField.value = "";
    chatbox.scrollTop = chatbox.scrollHeight;

    chatbox.innerHTML += `
        <div class="bot" id="typing">
            <div class="bubble">CyberBuddy is thinking... 🤔</div>
        </div>
    `;

    const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
    });

    const data = await response.json();

    document.getElementById("typing").remove();

    chatbox.innerHTML += `
        <div class="bot">
            <div class="bubble">${data.response}</div>
        </div>
    `;

    chatbox.scrollTop = chatbox.scrollHeight;
}

let quizQuestions = [
    {
        question: "What should you do if a stranger messages you online?",
        options: [
            "Give them your address",
            "Ignore and tell a trusted adult",
            "Send them a picture"
        ],
        answer: 1
    },
    {
        question: "What makes a strong password?",
        options: [
            "Your birthday",
            "123456",
            "A mix of letters, numbers, and symbols"
        ],
        answer: 2
    },
    {
        question: "What is phishing?",
        options: [
            "Catching fish",
            "A scam pretending to be someone you trust",
            "A video game"
        ],
        answer: 1
    }
];

let currentQuestion = 0;
let score = 0;

function startQuiz() {
    currentQuestion = 0;
    score = 0;
    showQuestion();
}

function showQuestion() {
    const chatbox = document.getElementById("chatbox");
    chatbox.innerHTML = "";

    let q = quizQuestions[currentQuestion];

    chatbox.innerHTML += `
        <div class="bot">
            <div class="bubble">❓ ${q.question}</div>
        </div>
    `;

    q.options.forEach((option, index) => {
        chatbox.innerHTML += `
            <div style="margin:8px 0;">
                <button onclick="checkAnswer(${index})">${option}</button>
            </div>
        `;
    });
}

function checkAnswer(selectedIndex) {
    const chatbox = document.getElementById("chatbox");

    if (selectedIndex === quizQuestions[currentQuestion].answer) {
        score++;
        chatbox.innerHTML += `
            <div class="bot">
                <div class="bubble">🎉 Correct! You're a cyber safety star!</div>
            </div>
        `;
    } else {
        chatbox.innerHTML += `
            <div class="bot">
                <div class="bubble">💡 Not quite! Let's keep learning!</div>
            </div>
        `;
    }

    currentQuestion++;

    if (currentQuestion < quizQuestions.length) {
        setTimeout(showQuestion, 1500);
    } else {
        setTimeout(showResults, 1500);
    }
}

function showResults() {
    const chatbox = document.getElementById("chatbox");

    chatbox.innerHTML = `
        <div class="bot">
            <div class="bubble">
                🏆 Quiz Complete! <br>
                Your Score: ${score} / ${quizQuestions.length} <br><br>
                ${score === quizQuestions.length ? "🌟 Amazing job!" : "👍 Great effort!"}
            </div>
        </div>
        <div style="margin-top:15px;">
            <button onclick="startQuiz()">🔁 Play Again</button>
        </div>
    `;
}