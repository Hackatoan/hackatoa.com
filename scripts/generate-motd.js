const fs = require('fs');
const path = require('path');

async function generateMOTD() {
    const apiKey = process.env.GEMINI_API_KEY;
    const fallbackMessage = "Stay curious. Keep building.";
    const outputPath = path.join(__dirname, '..', 'public', 'motd.json');

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY not found.");
        await writeOutput(outputPath, fallbackMessage, true);
        return;
    }

    const prompt = "Generate a short (1-2 sentences max), insightful, or witty message based on 'Today in History' or current global events for a developer portfolio. Just the message.";

    // Switching to the v1beta endpoint and using the models/ prefix
    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
    ];

    for (const model of modelsToTry) {
        try {
            console.log(`Attempting: ${model} via v1beta...`);
            // Note the /v1beta/ prefix and the models/ prefix
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            if (response.ok) {
                const message = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (message) {
                    const cleaned = message.trim().replace(/^["']|["']$/g, '');
                    await writeOutput(outputPath, cleaned, false);
                    console.log(`Success with ${model}!`);
                    return;
                }
            } else {
                console.warn(`${model} failed: ${data.error?.message || response.status}`);
            }
        } catch (err) {
            console.error(`Fetch error for ${model}:`, err.message);
        }
    }

    await writeOutput(outputPath, fallbackMessage, true);
}

async function writeOutput(targetPath, message, isError) {
    const finalOutput = { 
        message: message,
        lastUpdated: new Date().toISOString(),
        status: isError ? "fallback" : "success"
    };
    await fs.promises.writeFile(targetPath, JSON.stringify(finalOutput, null, 2));
}

generateMOTD();
