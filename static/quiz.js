let quizQuestions = [

/* ===== EASY (10) ===== */
{
    question: "What makes a password strong?",
    options: ["Your name", "123456", "12+ characters with symbols", "Your birthday"],
    correct: 2,
    explanation: "Strong passwords are long and use symbols, numbers, and letters."
},
{
    question: "What is phishing?",
    options: ["Fishing game", "Tricking you", "Virus", "App"],
    correct: 1,
    explanation: "Phishing tricks you into giving personal info."
},
{
    question: "Should you share your password?",
    options: ["Yes", "No", "Sometimes", "Only once"],
    correct: 1,
    explanation: "Never share your password."
},
{
    question: "What should you do with suspicious websites?",
    options: ["Stay", "Leave", "Enter info", "Download"],
    correct: 1,
    explanation: "Leave suspicious sites immediately."
},
{
    question: "What does HTTPS mean?",
    options: ["Secure site", "Game", "Fast internet", "Nothing"],
    correct: 0,
    explanation: "HTTPS means secure connection."
},
{
    question: "Is public Wi-Fi always safe?",
    options: ["Yes", "No", "Only weekends", "Only free"],
    correct: 1,
    explanation: "Public Wi-Fi can be risky."
},
{
    question: "What is malware?",
    options: ["Game", "Harmful software", "Browser", "Chat"],
    correct: 1,
    explanation: "Malware harms your device."
},
{
    question: "What should you do with unknown links?",
    options: ["Click", "Ignore", "Share", "Download"],
    correct: 1,
    explanation: "Ignore unknown links."
},
{
    question: "What is safe to share?",
    options: ["Address", "Phone", "Hobbies", "Password"],
    correct: 2,
    explanation: "Hobbies are safe, personal info is not."
},
{
    question: "Who do you tell if something feels wrong?",
    options: ["Nobody", "Stranger", "Trusted adult", "Friend"],
    correct: 2,
    explanation: "Always tell a trusted adult."
},

/* ===== MEDIUM (10) ===== */
{
    question: "What is a digital footprint?",
    options: ["Shoe size", "Online data trail", "Virus", "Password"],
    correct: 1,
    explanation: "Everything you do online leaves a trace."
},
{
    question: "What is 2FA?",
    options: ["Two passwords", "Extra login code", "Game", "Firewall"],
    correct: 1,
    explanation: "Adds extra security."
},
{
    question: "What should you do with pop-ups?",
    options: ["Click", "Close", "Enter info", "Download"],
    correct: 1,
    explanation: "Pop-ups can be fake."
},
{
    question: "What is identity theft?",
    options: ["Game", "Stealing info", "Virus", "Wi-Fi"],
    correct: 1,
    explanation: "Stealing personal data."
},
{
    question: "Why not reuse passwords?",
    options: ["No reason", "All accounts at risk", "Faster", "Safer"],
    correct: 1,
    explanation: "One hack risks all accounts."
},
{
    question: "What is social engineering?",
    options: ["Coding", "Tricking people", "Virus", "Game"],
    correct: 1,
    explanation: "Attackers trick users."
},
{
    question: "Safe social media practice?",
    options: ["Public account", "Share all", "Private account", "Accept all"],
    correct: 2,
    explanation: "Keep accounts private."
},
{
    question: "What is spyware?",
    options: ["Game", "Tracks you", "Browser", "App"],
    correct: 1,
    explanation: "Spyware collects data secretly."
},
{
    question: "Why check permissions?",
    options: ["No reason", "Apps misuse data", "Speed", "Fun"],
    correct: 1,
    explanation: "Apps may take extra data."
},
{
    question: "What is encryption?",
    options: ["Locking data", "Deleting", "Sharing", "Copying"],
    correct: 0,
    explanation: "Encryption protects information."
},

/* ===== HARD (10) ===== */
{
    question: "Why is HTTPS safer than HTTP?",
    options: ["Faster", "Encrypted data", "Free", "Looks better"],
    correct: 1,
    explanation: "HTTPS encrypts communication."
},
{
    question: "What is a brute force attack?",
    options: ["Guess passwords repeatedly", "Virus", "Firewall", "Download"],
    correct: 0,
    explanation: "Attackers try many passwords."
},
{
    question: "What does a VPN do?",
    options: ["Game", "Hide location", "Delete files", "Email"],
    correct: 1,
    explanation: "VPN hides IP and encrypts data."
},
{
    question: "What is a firewall?",
    options: ["Virus", "Blocks threats", "Game", "Browser"],
    correct: 1,
    explanation: "Protects network traffic."
},
{
    question: "What is ransomware?",
    options: ["Free app", "Locks data for money", "Game", "Browser"],
    correct: 1,
    explanation: "Demands payment to unlock files."
},
{
    question: "Why avoid public Wi-Fi for banking?",
    options: ["Slow", "Can be hacked", "Expensive", "Blocked"],
    correct: 1,
    explanation: "Attackers can steal data."
},
{
    question: "What is a deepfake?",
    options: ["Fake AI media", "Game", "Virus", "Password"],
    correct: 0,
    explanation: "AI-generated fake content."
},
{
    question: "Biggest phishing red flag?",
    options: ["Urgency", "Logo", "Politeness", "Length"],
    correct: 0,
    explanation: "Urgency pressures you."
},
{
    question: "Why use password managers?",
    options: ["Fun", "Store securely", "Faster typing", "Games"],
    correct: 1,
    explanation: "They store strong passwords safely."
},
{
    question: "What is multi-layer security?",
    options: ["One password", "Multiple protections", "None", "Wi-Fi only"],
    correct: 1,
    explanation: "More layers = stronger protection."
}

];

const allQuizQuestions = quizQuestions;

const quizLevels = {
    easy: allQuizQuestions.slice(0, 3),
    medium: allQuizQuestions.slice(3, 7),
    hard: allQuizQuestions.slice(7, 10)
};

let selectedLevel = "";

let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("quizQuestion");
const optionsEl = document.getElementById("quizOptions");
const feedbackEl = document.getElementById("quizFeedback");
const scoreDisplay = document.getElementById("scoreDisplay");
const questionCounter = document.getElementById("questionCounter");
const progressFill = document.getElementById("progressFill");
const leaderboardContainer = document.getElementById("leaderboardContainer");
const currentUsername = document.body.dataset.username || "";

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
            const username = entry[0];
            const score = entry[1];
            const isCurrentUser = username === currentUsername;

            html += `
                <tr style="${isCurrentUser ? 'background-color: #fff3cd; font-weight: bold;' : ''}">
                    <td style="padding:8px;">${index + 1}</td>
                    <td style="padding:8px;">${username}${isCurrentUser ? ' ⭐' : ''}</td>
                    <td style="padding:8px;">${score}</td>
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

function startLevel(level) {
    selectedLevel = level;
    quizQuestions = quizLevels[level];

    currentQuestion = 0;
    score = 0;

    document.getElementById("levelSelector").style.display = "none";
    document.getElementById("quizGame").style.display = "block";

    loadQuestion();
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

setTimeout(() => {
    loadLeaderboard();
}, 500);

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

loadLeaderboard();
