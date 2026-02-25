async function sendMessage() {
    const inputField = document.getElementById("userInput");
    const message = inputField.value;

    if (!message) return;

    const response = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message })
    });

    const data = await response.json();

    const chatbox = document.getElementById("chatbox");
    chatbox.innerHTML += `
        <p><strong>You:</strong> ${message}</p>
        <p><strong>CyberBuddy:</strong> ${data.response}</p>
    `;

    inputField.value = "";
}