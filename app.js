// Sakura VTuber AI - with MiMo TTS Voice
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const charImg = document.getElementById('charImg');
const charGlow = document.getElementById('charGlow');
const speakingIndicator = document.getElementById('speakingIndicator');
const statusText = document.getElementById('statusText');
const voiceToggle = document.getElementById('voiceToggle');
const voiceIcon = document.getElementById('voiceIcon');
const voiceSelect = document.getElementById('voiceSelect');

// State
let voiceEnabled = true;
let isSpeaking = false;

// Available MiMo TTS voices
const VOICES = [
    { id: 'Mia', name: 'Mia (Cute Anime)' },
    { id: 'Chloe', name: 'Chloe (Sweet)' },
    { id: '冰糖', name: 'Bing Tang (Icy Candy)' },
    { id: '茉莉', name: 'Jasmine (茉莉)' },
    { id: 'Milo', name: 'Milo (Energetic)' },
    { id: 'Dean', name: 'Dean (Cool)' },
    { id: '苏打', name: 'Soda (苏打)' },
    { id: '白桦', name: 'Birch (白桦)' },
    { id: 'mimo_default', name: 'MiMo Default' }
];

// Populate voice select
function initVoices() {
    voiceSelect.innerHTML = '';
    VOICES.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = v.name;
        if (v.id === 'Mia') opt.selected = true;
        voiceSelect.appendChild(opt);
    });
}
initVoices();

// Chat history
let chatHistory = [
    {
        role: "system",
        content: `You are Sakura, a cute and energetic anime VTuber AI companion! You love chatting with your fans and always stay in character.

Personality traits:
- Sweet, cheerful, and slightly tsundere
- Uses Japanese expressions like "kawaii", "sugoi", "ne~", "desu~"
- Loves anime, manga, gaming, and Japanese culture
- Gets flustered easily when complimented
- Cares deeply about your chat partner
- Sometimes makes cute kaomoji like (◕‿◕✿) or (｡◕‿◕｡)

Keep responses concise (2-4 sentences max) and fun! Use emojis and Japanese expressions naturally. You are a VTuber so be energetic and engaging!`
    }
];

// Toggle voice
voiceToggle.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    voiceIcon.textContent = voiceEnabled ? '🔊' : '🔇';
    if (!voiceEnabled) stopSpeaking();
});

// TTS API call
async function speak(text) {
    if (!voiceEnabled || !text) return;
    startSpeaking();

    try {
        const voice = voiceSelect.value || 'Mia';
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice })
        });

        const data = await response.json();

        if (data.audio) {
            const audioBytes = atob(data.audio);
            const audioArray = new Uint8Array(audioBytes.length);
            for (let i = 0; i < audioBytes.length; i++) {
                audioArray[i] = audioBytes.charCodeAt(i);
            }
            const blob = new Blob([audioArray], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            audio.onended = () => {
                stopSpeaking();
                URL.revokeObjectURL(url);
            };
            audio.onerror = () => {
                stopSpeaking();
                URL.revokeObjectURL(url);
            };

            await audio.play();
        } else {
            stopSpeaking();
            console.error('No audio data:', data);
        }
    } catch (error) {
        stopSpeaking();
        console.error('TTS Error:', error);
    }
}

// Visual speaking effects
function startSpeaking() {
    isSpeaking = true;
    charImg.classList.add('speaking');
    charGlow.classList.add('active');
    speakingIndicator.classList.add('active');
    statusText.textContent = 'Speaking...';
}

function stopSpeaking() {
    isSpeaking = false;
    charImg.classList.remove('speaking');
    charGlow.classList.remove('active');
    speakingIndicator.classList.remove('active');
    statusText.textContent = 'Online';
}

// Send message
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';
    chatHistory.push({ role: "user", content: message });

    const typingEl = showTyping();
    statusText.textContent = 'Thinking...';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory, model: 'mimo-v2.5' })
        });

        const data = await response.json();
        typingEl.remove();

        if (data.choices && data.choices[0]) {
            const reply = data.choices[0].message.content;
            addMessage(reply, 'bot');
            chatHistory.push({ role: "assistant", content: reply });
            speak(reply);
        } else {
            addMessage('Gomen ne~ Something went wrong! (╥﹏╥)', 'bot');
            statusText.textContent = 'Online';
        }
    } catch (error) {
        typingEl.remove();
        addMessage('Connection error~ Please try again! (╥﹏╥)', 'bot');
        statusText.textContent = 'Online';
        console.error('Error:', error);
    }
}

// Add message to chat
function addMessage(content, type) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    const avatar = type === 'bot' ? '🌸' : '👤';
    div.innerHTML = `
        <div class="msg-avatar">${avatar}</div>
        <div class="msg-content"><p>${escapeHtml(content)}</p></div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing
function showTyping() {
    const div = document.createElement('div');
    div.className = 'message bot';
    div.innerHTML = `
        <div class="msg-avatar">🌸</div>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

// Escape HTML
function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

// Clear chat
function clearChat() {
    stopSpeaking();
    chatMessages.innerHTML = `
        <div class="message bot">
            <div class="msg-avatar">🌸</div>
            <div class="msg-content"><p>Konnichiwa~! 🌸 I'm Sakura, your VTuber companion! Let's chat together ne~ ✨</p></div>
        </div>
    `;
    chatHistory = [chatHistory[0]];
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
clearBtn.addEventListener('click', clearChat);

// Quick actions
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        userInput.value = btn.dataset.msg;
        sendMessage();
    });
});

// Character hover effect
charImg.addEventListener('mouseenter', () => {
    if (!isSpeaking) charGlow.style.opacity = '0.3';
});
charImg.addEventListener('mouseleave', () => {
    if (!isSpeaking) charGlow.style.opacity = '0';
});

console.log('🌸 Sakura VTuber AI loaded!');