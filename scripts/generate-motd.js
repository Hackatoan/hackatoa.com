const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateMOTD() {
    const apiKey = process.env.GEMINI_API_KEY;
    const outputPath = path.join(__dirname, '..', 'public', 'motd.json');
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY not found.");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = "Generate a short (1-2 sentences max), insightful, or witty message based on 'Today in History' or current global events for a developer portfolio. Just the message.";

    const modelsToTry = [
        "gemini-3.1-flash-lite-preview", // 500 RPD free tier — highest quota, try first
        "gemini-3-flash-preview",         // 20 RPD free tier
        "gemini-2.5-flash",               // 20 RPD free tier
        "gemini-2.5-flash-lite",          // 20 RPD free tier
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const message = result.response.text();

            if (message && message.trim()) {
                const cleaned = message.trim().replace(/^["']|["']$/g, '');
                await writeOutput(outputPath, cleaned);
                console.log(`Success with ${modelName}: ${cleaned}`);
                return;
            }

            console.warn(`${modelName} returned empty response, trying next...`);
        } catch (err) {
            // Parse retry delay from 429 responses and wait before trying next model
            if (err.message.includes('429')) {
                const match = err.message.match(/retry in (\d+(\.\d+)?)s/i);
                const waitMs = match ? Math.ceil(parseFloat(match[1])) * 1000 : 35000;
                console.warn(`${modelName} quota exceeded. Waiting ${waitMs / 1000}s before next attempt...`);
                await new Promise(res => setTimeout(res, waitMs));
            } else {
                console.error(`Error with ${modelName}:`, err.message);
            }
        }
    }

    // All models failed — do NOT write fallback, exit with error so CI fails
    console.error("ERROR: All models failed. No MOTD generated.");
    process.exit(1);
}

async function writeOutput(targetPath, message) {
    const finalOutput = {
        message: message,
        lastUpdated: new Date().toISOString(),
        status: "success"
    };
    await fs.promises.writeFile(targetPath, JSON.stringify(finalOutput, null, 2));
}

if (require.main === module) {
    generateMOTD().catch((err) => {
        console.error("Unhandled error:", err);
        process.exit(1);
    });
}

module.exports = { generateMOTD, writeOutput };
