const quizQuestions = [
    {
        question: "What makes a password strong?",
        options: [
            "Your name and birthday",
            "At least 12 characters with letters, numbers, and symbols",
            "The word password",
            "Your favorite color"
        ],
        correct: 1,
        explanation: "Strong passwords should be long and include a mix of letters, numbers, and symbols."
    },
    {
        question: "What is phishing?",
        options: [
            "A fun fishing game",
            "A trick to steal your information using fake messages",
            "A new social media app",
            "A type of antivirus"
        ],
        correct: 1,
        explanation: "Phishing is when scammers pretend to be trustworthy to steal passwords or personal information."
    },
    {
        question: "Should you share your password with your best friend?",
        options: [
            "Yes, if they promise not to tell",
            "No, never share passwords",
            "Only if they really need it",
            "Yes, if it’s just once"
        ],
        correct: 1,
        explanation: "Passwords should stay private, even from friends."
    },
    {
        question: "What should you do if someone you do not know sends you a friend request?",
        options: [
            "Accept it right away",
            "Send them your address",
            "Verify who they are first",
            "Give them your number"
        ],
        correct: 2,
        explanation: "Always verify unknown people before accepting requests online."
    },
    {
        question: "What is a digital footprint?",
        options: [
            "Your shoe size online",
            "The trail of information you leave online",
            "A computer virus",
            "A secret password"
        ],
        correct: 1,
        explanation: "Your digital footprint is everything you post, like, and share online."
    },
    {
        question: "What should you do if a pop-up says your device has a virus?",
        options: [
            "Click it quickly",
            "Close the pop-up without clicking it",
            "Enter your credit card",
            "Download random software"
        ],
        correct: 1,
        explanation: "Many virus pop-ups are fake. Close them and do not click."
    },
    {
        question: "What is safe to share on social media?",
        options: [
            "Your home address",
            "Your school schedule",
            "Your hobbies without personal details",
            "Your phone number"
        ],
        correct: 2,
        explanation: "It is safer to share interests, but not personal details like address or phone number."
    },
    {
        question: "What should you do if someone is being mean to you online?",
        options: [
            "Be mean back",
            "Block them and tell a trusted adult",
            "Share your password",
            "Post their messages everywhere"
        ],
        correct: 1,
        explanation: "Block the person, save evidence if needed, and tell a trusted adult."
    },
    {
        question: "What does 2FA mean?",
        options: [
            "Two funny accounts",
            "Extra login security using a code",
            "A second password only",
            "Logging in twice for fun"
        ],
        correct: 1,
        explanation: "2FA adds an extra layer of security by requiring a second code."
    },
    {
        question: "Is public Wi-Fi always safe?",
        options: [
            "Yes, always",
            "No, it can be risky",
            "Only on weekends",
            "Only if it is free"
        ],
        correct: 1,
        explanation: "Public Wi-Fi can be unsafe, especially for logging into important accounts."
    }
];

let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("quizQuestion");
const optionsEl = document.getElementById("quizOptions");
const feedbackEl = document.getElementById("quizFeedback");
const scoreDisplay = document.getElementById("scoreDisplay");
const questionCounter = document.getElementById("questionCounter");
const progressFill = document.getElementById("progressFill");
const leaderboardContainer = document.getElementById("leaderboardContainer");

async function loadLeaderboard() {
    try {
        const response = await fetch("/leaderboard-data");
        const data = await response.json();

        if (!data.leaderboard || data.leaderboard.length === 0) {
            leaderboardContainer.innerHTML = "<p>No quiz results yet.</p>";
            return;
        }

        let html = `
            <table style="width:100%; text-align:left; border-collapse: collapse;">
                <tr>
                    <th style="padding:8px;">Rank</th>
                    <th style="padding:8px;">Username</th>
                    <th style="padding:8px;">Best Score</th>
                </tr>
        `;

        data.leaderboard.forEach((entry, index) => {
            html += `
                <tr>
                    <td style="padding:8px;">${index + 1}</td>
                    <td style="padding:8px;">${entry[0]}</td>
                    <td style="padding:8px;">${entry[1]}</td>
                </tr>
            `;
        });

        html += "</table>";
        leaderboardContainer.innerHTML = html;
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        leaderboardContainer.innerHTML = "<p>Could not load leaderboard.</p>";
    }
}

function loadQuestion() {
    const q = quizQuestions[currentQuestion];

    questionEl.textContent = q.question;
    optionsEl.innerHTML = "";
    feedbackEl.className = "quiz-feedback";
    feedbackEl.style.display = "none";
    feedbackEl.innerHTML = "";

    questionCounter.textContent = `Question ${currentQuestion + 1} of ${quizQuestions.length}`;
    scoreDisplay.textContent = `Score: ${score}`;
    progressFill.style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;

    q.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option";
        btn.textContent = option;
        btn.onclick = () => checkAnswer(index);
        optionsEl.appendChild(btn);
    });
}

function checkAnswer(selectedIndex) {
    const q = quizQuestions[currentQuestion];
    const optionButtons = document.querySelectorAll(".quiz-option");

    optionButtons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === q.correct) {
            btn.classList.add("correct");
        } else if (index === selectedIndex) {
            btn.classList.add("wrong");
        }
    });

    const isCorrect = selectedIndex === q.correct;

    if (isCorrect) {
        score++;
        feedbackEl.className = "quiz-feedback show correct";
        feedbackEl.innerHTML = `<strong>✅ Correct!</strong><br>${q.explanation}`;
    } else {
        feedbackEl.className = "quiz-feedback show wrong";
        feedbackEl.innerHTML = `<strong>❌ Not quite!</strong><br>${q.explanation}`;
    }

    scoreDisplay.textContent = `Score: ${score}`;

    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < quizQuestions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }, 2200);
}

async function saveQuizResult() {
    try {
        const response = await fetch("/save_quiz_result", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                score: score,
                total_questions: quizQuestions.length
            })
        });

        const data = await response.json();
        console.log("Quiz result saved:", data);
    } catch (error) {
        console.error("Error saving quiz result:", error);
    }
}

function showResults() {
    saveQuizResult();
    let message = "";
    let emoji = "";

    const percent = Math.round((score / quizQuestions.length) * 100);

    if (percent >= 80) {
        emoji = "🏆";
        message = "Amazing job! You're a cyber safety star!";
    } else if (percent >= 60) {
        emoji = "⭐";
        message = "Nice work! You know a lot about staying safe online.";
    } else {
        emoji = "💪";
        message = "Good effort! Keep practicing and you'll get even stronger.";
    }

    questionEl.innerHTML = `${emoji} Quiz Complete!`;
    optionsEl.innerHTML = `
        <div style="text-align:center; font-size:18px; color:#2d6cdf;">
            <p><strong>Your score:</strong> ${score} out of ${quizQuestions.length}</p>
            <p>${message}</p>
            <button onclick="restartQuiz()" style="margin-top: 10px;">Try Again</button>
        </div>
    `;
    feedbackEl.style.display = "none";
    questionCounter.textContent = "Finished!";
    progressFill.style.width = "100%";
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    loadQuestion();
}

loadQuestion();
loadLeaderboard();