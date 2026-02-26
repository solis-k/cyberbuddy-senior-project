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
