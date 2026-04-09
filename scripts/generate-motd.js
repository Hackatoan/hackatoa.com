const fs = require('fs');
const path = require('path');

async function generateMOTD() {
    const apiKey = process.env.GEMINI_API_KEY;
    const fallbackMessage = "Stay curious. Keep building.";
    const outputPath = path.join(__dirname, '..', 'public', 'motd.json');

    // Ensure the public directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY not found in environment.");
        await fs.promises.writeFile(outputPath, JSON.stringify({ message: fallbackMessage }, null, 2));
        return;
    }

    const prompt = "Generate a short (1-2 sentences max), insightful, or witty message based on 'Today in History' or current global events. It should be suitable for a developer/cybersecurity enthusiast's portfolio website. Do not include any greeting or conversational filler, just the message itself.";

    try {
        // Updated to stable v1 endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 150 }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        let message = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!message) {
            throw new Error("API response format unexpected: No text found.");
        }

        message = message.trim().replace(/^["']|["']$/g, '');

        const finalOutput = { 
            message: message,
            lastUpdated: new Date().toISOString() // Added timestamp to ensure the file always changes
        };

        await fs.promises.writeFile(outputPath, JSON.stringify(finalOutput, null, 2));
        console.log("Successfully generated MOTD:", message);

    } catch (error) {
        console.error("MOTD Generation Failed:", error.message);
        // We still write the fallback, but include a timestamp so Git sees a "change"
        await fs.promises.writeFile(outputPath, JSON.stringify({ 
            message: fallbackMessage, 
            error: true,
            lastUpdated: new Date().toISOString() 
        }, null, 2));
    }
}

generateMOTD();
