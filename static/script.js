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

    console.log("sending:", username, password);

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

    if (username) {
        const chatBox = document.getElementById("chat-box");

        chatBox.innerHTML += `
            <div class="bot-message">
                👋 Hi ${username}! I'm CyberBuddy. Ready to stay safe online today?
            </div>
        `;
    }
};