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
        await writeOutput(outputPath, fallbackMessage, true);
        return;
    }

    const prompt = "Generate a short (1-2 sentences max), insightful, or witty message based on 'Today in History' or current global events. It should be suitable for a developer's portfolio website. No conversational filler, just the message.";

    // We will try Flash first, then Pro as a backup to avoid 404s
    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
    ];

    for (const model of modelsToTry) {
        try {
            console.log(`Attempting to generate MOTD with model: ${model}...`);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const message = data.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (message) {
                    const cleanedMessage = message.trim().replace(/^["']|["']$/g, '');
                    await writeOutput(outputPath, cleanedMessage, false);
                    console.log(`Successfully generated MOTD with ${model}:`, cleanedMessage);
                    return; // Exit success!
                }
            } else {
                const errorText = await response.text();
                console.warn(`Model ${model} failed (${response.status}): ${errorText}`);
            }
        } catch (err) {
            console.error(`Error with ${model}:`, err.message);
        }
    }

    // If we get here, all models failed
    console.error("All models failed. Writing fallback message.");
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
