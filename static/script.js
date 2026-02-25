async function sendMessage() {
    const inputField = document.getElementById("userInput");
    const message = inputField.value;

    if (!message) return;

    const chatbox = document.getElementById("chatbox");

    chatbox.innerHTML += `
        <div class="message-user">
            <strong>You:</strong> ${message}
        </div>
    `;

    inputField.value = "";

    const response = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message })
    });

    const data = await response.json();

    chatbox.innerHTML += `
        <div class="message-bot">
            <strong>CyberBuddy:</strong> ${data.response}
        </div>
    `;

    chatbox.scrollTop = chatbox.scrollHeight;
}