const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = "Generate a short (1-2 sentences max), insightful, or witty message based on 'Today in History' or current global events for a developer portfolio. Just the message.";

    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const message = result.response.text();

            if (message) {
                const cleaned = message.trim().replace(/^["']|["']$/g, '');
                await writeOutput(outputPath, cleaned, false);
                console.log(`Success with ${modelName}!`);
                return;
            }
        } catch (err) {
            console.error(`Error with ${modelName}:`, err.message);
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

if (require.main === module) {
    generateMOTD();
}

module.exports = { generateMOTD, writeOutput };
