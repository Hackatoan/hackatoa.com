const fs = require('fs');
const path = require('path');

async function generateMOTD() {
    const apiKey = process.env.GEMINI_API_KEY;
    const fallbackMessage = "Stay curious. Keep building.";
    const outputPath = path.join(__dirname, '..', 'public', 'motd.json');

    if (!apiKey) {
        console.warn("GEMINI_API_KEY not found in environment. Using fallback message.");
        await fs.promises.writeFile(outputPath, JSON.stringify({ message: fallbackMessage }, null, 2));
        return;
    }

    const prompt = "Generate a short (1-2 sentences max), insightful, or witty message based on 'Today in History' or current global events. It should be suitable for a developer/cybersecurity enthusiast's portfolio website. Do not include any greeting or conversational filler, just the message itself.";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100
                }
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API returned ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        let message = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!message) {
            throw new Error("No message found in API response.");
        }

        // Clean up the message (remove quotes if any, trim whitespace)
        message = message.trim().replace(/^["']|["']$/g, '');

        const finalOutput = { message: message };
        await fs.promises.writeFile(outputPath, JSON.stringify(finalOutput, null, 2));
        console.log("Successfully generated MOTD:", finalOutput.message);

    } catch (error) {
        console.error("Failed to generate MOTD using Gemini API:", error);
        console.log("Writing fallback message to motd.json");
        await fs.promises.writeFile(outputPath, JSON.stringify({ message: fallbackMessage }, null, 2));
    }
}

generateMOTD();