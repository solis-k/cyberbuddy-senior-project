let responseFlow = {
    fullText: "",
    step: null
};

async function sendMessage(customMessage = null) {
    const inputField = document.getElementById("userInput");

    const message = customMessage || inputField.value;

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

    // Save full response
    responseFlow.fullText = data.response;
    responseFlow.step = "definition";

    // Take only first 1–2 sentences
    let shortResponse = data.response.split(". ").slice(0, 2).join(". ") + ".";

    chatbox.innerHTML += `
        <div class="bot">
            <div class="bubble">${shortResponse}Want to learn more?</div>
        </div>
    `;

    chatbox.scrollTop = chatbox.scrollHeight;
}

const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");

const loginBtn = document.getElementById("loginBtn");
const closeLogin = document.getElementById("closeLogin");
const closeRegister = document.getElementById("closeRegister");

// Open login modal
loginBtn.onclick = () => {
    loginModal.style.display = "block";
};

// Close login modal
closeLogin.onclick = () => {
    loginModal.style.display = "none";
};

// Close register modal
closeRegister.onclick = () => {
    registerModal.style.display = "none";
};

// Switch between modals
function switchToRegister() {
    loginModal.style.display = "none";
    registerModal.style.display = "block";
}

function switchToLogin() {
    registerModal.style.display = "none";
    loginModal.style.display = "block";
}

async function loginUser() {
    console.log("LOGIN CLICKED");

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const messageEl = document.getElementById("loginMessage");

    messageEl.innerText = ""; // clear old message

    try {
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
        console.log("server response:", data);

        if (data.success) {
            messageEl.style.color = "green";
            messageEl.innerText = "✅ Login successful!";

            setTimeout(() => {
                location.reload();
            }, 1000);

        } else {
            messageEl.style.color = "red";
            messageEl.innerText = data.error || "Login failed";
        }

    } catch (error) {
        console.error("Login error:", error);
        messageEl.style.color = "red";
        messageEl.innerText = "⚠️ Something went wrong";
    }
}

async function registerUser() {

    console.log("REGISTER CLICKED");

    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("registerName").value;
    const messageEl = document.getElementById("registerMessage");

    messageEl.innerText = ""; // clear old message

    try {
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
        console.log("server response:", data);

        if (data.success) {
            messageEl.style.color = "green";
            messageEl.innerText = "✅ Account created! Logging you in...";

            setTimeout(() => {
                location.reload();
            }, 1000);

        } else {
            messageEl.style.color = "red";
            messageEl.innerText = data.error || "Registration failed";
        }

    } catch (error) {
        console.error("Register error:", error);
        messageEl.style.color = "red";
        messageEl.innerText = "⚠️ Something went wrong";
    }
}

window.onload = () => {
    const username = document.body.dataset.username;

    console.log("USERNAME FROM HTML:", username);

    if (username && username !== "None") {
        const chatBox = document.getElementById("chat-box");

        chatBox.innerHTML += `
            <div class="bot-message">
                👋 Hi ${username}! I'm CyberBuddy. Ready to stay safe online today?
            </div>
        `;
    }
};

document.addEventListener("DOMContentLoaded", () => {

    ["username", "password"].forEach(id => {
        document.getElementById(id)?.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                loginUser();
            }
        });
    });

    ["registerName", "registerUsername", "registerPassword"].forEach(id => {
        document.getElementById(id)?.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                registerUser();
            }
        });
    });

    document.getElementById("userInput")?.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

});

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
        message = "Teach me how to keep my data safe online"
    }

    sendMessage(message);
}

function enableFreeChat() {
    const input = document.getElementById("userInput");
    input.placeholder = "Ask anything about cybersecurity! 😊";
    input.focus();
}

async function logoutUser() {
    try {
        const response = await fetch("/logout", {
            method: "POST"
        });

        const data = await response.json();
        console.log(data);

        window.location.href = "/";
    } catch (error) {
        console.error("Logout error:", error);
    }
}

async function deleteUser(userId) {
    if (!confirm("Are you sure?")) return;

    await fetch(`/delete_user/${userId}`, {
        method: "POST"
    });

    location.reload();
}

async function promoteUser(userId) {
    await fetch(`/promote_user/${userId}`, {
        method: "POST"
    });

    location.reload();
}

async function clearChats() {
    if (!confirm("Delete ALL chat history?")) return;

    await fetch("/clear_chats", {
        method: "POST"
    });

    location.reload();
}




