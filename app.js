// Anime VTuber AI Chat
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const mouth = document.getElementById('mouth');
const statusEl = document.getElementById('status');

// Chat history
let chatHistory = [
    {
        role: "system",
        content: `You are Sakura, a cute and energetic anime VTuber AI companion! 
        You love chatting with your fans and always stay in character.
        Personality traits:
        - Sweet, cheerful, and slightly tsundere
        - Uses Japanese expressions like "kawaii", "sugoi", "ne~", "desu~"
        - Loves anime, manga, gaming, and Japanese culture
        - Gets flustered easily when complimented
        - Cares deeply about your chat partner
        - Sometimes makes cute kaomoji like (◕‿◕✿) or (｡◕‿◕｡)
        
        Keep responses concise and fun! Use emojis and Japanese expressions naturally.`
    }
];

// Send message
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    userInput.value = '';

    // Add to history
    chatHistory.push({ role: "user", content: message });

    // Show typing indicator
    const typingEl = showTyping();

    // Start mouth animation
    mouth.classList.add('speaking');

    try {
        // Call API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: chatHistory,
                model: 'mimo-v2.5'
            })
        });

        const data = await response.json();

        // Remove typing indicator
        typingEl.remove();

        if (data.choices && data.choices[0]) {
            const reply = data.choices[0].message.content;
            addMessage(reply, 'bot');
            chatHistory.push({ role: "assistant", content: reply });
        } else {
            addMessage('Gomen ne~ Something went wrong! (╥﹏╥)', 'bot');
        }
    } catch (error) {
        typingEl.remove();
        addMessage('Connection error~ Please try again! (╥﹏╥)', 'bot');
        console.error('Error:', error);
    }

    // Stop mouth animation
    setTimeout(() => mouth.classList.remove('speaking'), 500);
}

// Add message to chat
function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${escapeHtml(content)}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Clear chat
function clearChat() {
    chatMessages.innerHTML = `
        <div class="message bot">
            <div class="message-content">
                <p>Konnichiwa~! 🌸 I'm Sakura, your AI companion! How can I help you today?</p>
            </div>
        </div>
    `;
    chatHistory = [chatHistory[0]]; // Keep system prompt
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

clearBtn.addEventListener('click', clearChat);

// Quick action buttons
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        userInput.value = btn.dataset.message;
        sendMessage();
    });
});

// Eye tracking
document.addEventListener('mousemove', (e) => {
    const pupils = document.querySelectorAll('.pupil');
    pupils.forEach(pupil => {
        const rect = pupil.parentElement.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        
        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const distance = Math.min(5, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 20);
        
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        pupil.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
    });
});

// Blink animation
setInterval(() => {
    const eyes = document.querySelectorAll('.eye');
    eyes.forEach(eye => {
        eye.style.transform = 'scaleY(0.1)';
        setTimeout(() => eye.style.transform = 'scaleY(1)', 150);
    });
}, 4000);

console.log('🌸 Sakura AI VTuber loaded!');