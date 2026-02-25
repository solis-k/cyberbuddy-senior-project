async function sendMessage() {
    const inputField = document.getElementById("userInput");
    const message = inputField.value;

    if (!message) return;

    const chatbox = document.getElementById("chatbox");

    chatbox.innerHTML += `
        <div class="message-user">
            <div class="bubble user-bubble">${message}</div>
        </div>
    `;

    inputField.value = "";
    chatbox.scrollTop = chatbox.scrollHeight;

    const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
    });

    const data = await response.json();

    chatbox.innerHTML += `
        <div class="message-bot">
            <div class="bubble bot-bubble">${data.response}</div>
        </div>
    `;

    chatbox.scrollTop = chatbox.scrollHeight;
}