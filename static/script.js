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
            <div class="bubble">${shortResponse}</div>
        </div>
    `;

    chatbox.scrollTop = chatbox.scrollHeight;
}

const modal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const closeBtn = document.getElementById("closeLogin");

loginBtn.onclick = () => {
    modal.style.display = "block";
};

closeBtn.onclick = () => {
    modal.style.display = "none";
};

async function loginUser() {

    console.log("LOGIN CLICKED");

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    console.log("sending login:", username, password);

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

    console.log("response received");

    const data = await response.json();
    console.log("server response:", data);

    if (data.success) {
        alert("Login successful!");
        location.reload();
    } else {
        alert("Login failed");
    }
}

async function registerUser() {

    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    const response = await fetch("/register", {
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
        alert("Account created! You can now log in.");
    } else {
        alert(data.error);
    }
}

async function registerUser() {

    console.log("REGISTER CLICKED");

    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("registerName").value;

    console.log("sending:", username, password);

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

    console.log("response received");

    const data = await response.json();
    console.log("server response:", data);

    if (data.success) {
        alert("Account created!");
    } else {
        alert(data.error || "Registration failed");
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
    if (!confirm("Are you sure you want to delete this user?")) return;

    await fetch(`/delete_user/${userId}`, {
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

async function promoteUser(userId) {
    await fetch(`/promote_user/${userId}`, { method: "POST" });
    location.reload();
}

