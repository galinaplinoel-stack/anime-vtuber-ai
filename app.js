// Sakura VTuber AI
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const charImg = document.getElementById('charImg');
const charGlow = document.getElementById('charGlow');
const waves = document.getElementById('waves');
const voiceToggle = document.getElementById('voiceToggle');
const voiceSelect = document.getElementById('voiceSelect');

let voiceEnabled = true;
let chatHistory = [{
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
}];

// Toggle voice
voiceToggle.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    voiceToggle.textContent = voiceEnabled ? '🔊' : '🔇';
    if (!voiceEnabled) stopSpeaking();
});

// TTS
async function speak(text) {
    if (!voiceEnabled || !text) return;
    startSpeaking();
    try {
        const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice: voiceSelect.value })
        });
        const data = await res.json();
        if (data.audio) {
            const bytes = atob(data.audio);
            const arr = new Uint8Array(bytes.length);
            for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
            const blob = new Blob([arr], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.onended = () => { stopSpeaking(); URL.revokeObjectURL(url); };
            audio.onerror = () => { stopSpeaking(); URL.revokeObjectURL(url); };
            await audio.play();
        } else stopSpeaking();
    } catch (e) { stopSpeaking(); console.error('TTS:', e); }
}

function startSpeaking() {
    charImg.classList.add('speaking');
    charGlow.classList.add('on');
    waves.classList.add('on');
}

function stopSpeaking() {
    charImg.classList.remove('speaking');
    charGlow.classList.remove('on');
    waves.classList.remove('on');
}

// Send message
async function sendMessage() {
    const msg = userInput.value.trim();
    if (!msg) return;
    addMsg(msg, 'user');
    userInput.value = '';
    chatHistory.push({ role: "user", content: msg });

    const typing = showTyping();
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory, model: 'mimo-v2.5' })
        });
        const data = await res.json();
        typing.remove();
        if (data.choices?.[0]) {
            const reply = data.choices[0].message.content;
            addMsg(reply, 'bot');
            chatHistory.push({ role: "assistant", content: reply });
            speak(reply);
        } else addMsg('Gomen ne~ Something went wrong! (╥﹏╥)', 'bot');
    } catch (e) {
        typing.remove();
        addMsg('Connection error~ (╥﹏╥)', 'bot');
    }
}

function addMsg(content, type) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerHTML = `<div class="avatar">${type === 'bot' ? '🌸' : '👤'}</div><div class="bubble">${esc(content)}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.innerHTML = `<div class="avatar">🌸</div><div class="typing"><span></span><span></span><span></span></div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function clearChat() {
    stopSpeaking();
    chatMessages.innerHTML = `<div class="msg bot"><div class="avatar">🌸</div><div class="bubble">Konnichiwa~! 🌸 I'm Sakura, your VTuber companion! Let's chat together ne~ ✨</div></div>`;
    chatHistory = [chatHistory[0]];
}

// Events
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
clearBtn.addEventListener('click', clearChat);
document.querySelectorAll('.quick-bar button').forEach(b => {
    b.addEventListener('click', () => { userInput.value = b.dataset.msg; sendMessage(); });
});

console.log('🌸 Sakura VTuber AI loaded!');