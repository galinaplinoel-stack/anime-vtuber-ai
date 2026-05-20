export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (req.method !== 'POST') { return res.status(405).json({ error: 'Method not allowed' }); }

    try {
        const { text, voice } = req.body;
        const API_KEY = process.env.AI_API_KEY;
        const API_URL = process.env.AI_API_URL || 'https://token-plan-sgp.xiaomimimo.com/v1';

        if (!API_KEY) return res.status(500).json({ error: 'API key not configured' });
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const response = await fetch(`${API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'mimo-v2.5-tts',
                messages: [
                    { role: 'user', content: 'Please say this in a cute anime voice' },
                    { role: 'assistant', content: text }
                ],
                modalities: ['text', 'audio'],
                audio: { voice: voice || 'Mia', format: 'mp3' }
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0] && data.choices[0].message.audio) {
            const audioData = data.choices[0].message.audio.data;
            return res.status(200).json({ audio: audioData });
        } else {
            return res.status(500).json({ error: 'No audio in response', detail: data });
        }
    } catch (error) {
        console.error('TTS Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}