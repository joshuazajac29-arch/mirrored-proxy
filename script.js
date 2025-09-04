const API_URL = 'https://your-render-app.onrender.com'; // Replace with your Render URL

let messages = [];

async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/messages`);
        messages = await response.json();
        displayMessages();
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function displayMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
    
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = msg.text;
        messagesContainer.appendChild(messageDiv);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (text) {
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });
            
            if (response.ok) {
                input.value = '';
                loadMessages();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
}

// Load messages on page load and refresh every 2 seconds
loadMessages();
setInterval(loadMessages, 2000);

// Send message on Enter key
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
