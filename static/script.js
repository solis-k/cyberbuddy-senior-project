async function sendMessage(customMessage = null) {
    const inputField = document.getElementById("userInput");
    const message = (customMessage || inputField.value).trim();

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

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        const typingBubble = document.getElementById("typing");
        if (typingBubble) typingBubble.remove();

        chatbox.innerHTML += `
            <div class="bot">
                <div class="bubble">${data.response}</div>
            </div>
        `;

        chatbox.scrollTop = chatbox.scrollHeight;
    } catch (error) {
        const typingBubble = document.getElementById("typing");
        if (typingBubble) typingBubble.remove();

        chatbox.innerHTML += `
            <div class="bot">
                <div class="bubble">Oops! Something went wrong 😅</div>
            </div>
        `;
    }
}

const modal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const closeBtn = document.getElementById("closeLogin");

if (loginBtn && modal) {
    loginBtn.onclick = () => {
        modal.style.display = "block";
    };
}

if (closeBtn && modal) {
    closeBtn.onclick = () => {
        modal.style.display = "none";
    };
}

async function loginUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    const data = await response.json();

    if (data.success) {
        alert("Login successful!");
        location.reload();
    } else {
        alert(data.error || "Login failed");
    }
}

async function registerUser() {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("registerName").value;

    const response = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            username: username,
            password: password
        })
    });

    const data = await response.json();

    if (data.success) {
        alert("Account created!");
        location.reload();
    } else {
        alert(data.error || "Registration failed");
    }
}

window.onload = () => {
    setupMusic();
};

function selectTopic(topic) {
    let message = "";

    if (topic === "phishing") {
        message = "Teach me about phishing scams";
    } else if (topic === "passwords") {
        message = "How do I create strong passwords?";
    } else if (topic === "browsing") {
        message = "How can I browse the internet safely?";
    } else if (topic === "social") {
        message = "How can I stay safe on social media?";
    } else if (topic === "ai") {
        message = "Teach me about AI safety";
    } else if (topic === "viruses") {
        message = "Teach me about viruses and malware";
    } else if (topic === "data") {
        message = "Teach me how to keep my data safe online";
    }

    sendMessage(message);
}

function enableFreeChat() {
    const input = document.getElementById("userInput");
    if (!input) return;
    input.placeholder = "Ask anything about cybersecurity! 😊";
    input.focus();
}

function setupMusic() {
    const music = document.getElementById("bgMusic");
    const toggleBtn = document.getElementById("musicToggle");

    if (!music || !toggleBtn) return;

    let started = false;

    const startMusic = () => {
        if (!started) {
            music.volume = 0.22;
            music.play().then(() => {
                started = true;
                toggleBtn.textContent = "🔊";
            }).catch(() => {});
        }
    };

    document.body.addEventListener("click", startMusic, { once: true });

    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (music.paused) {
            music.play().then(() => {
                started = true;
                toggleBtn.textContent = "🔊";
            }).catch(() => {});
        } else {
            music.pause();
            toggleBtn.textContent = "🔇";
        }
    });
}
