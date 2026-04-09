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

    // Read existing data to get current message and full history
    let previousMessage = null;
    let history = [];
    try {
        const existing = JSON.parse(await fs.promises.readFile(outputPath, 'utf8'));
        if (existing?.message) previousMessage = existing.message;
        if (Array.isArray(existing?.history)) history = existing.history;
    } catch {
        // File doesn't exist yet, that's fine
    }

    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    const avoidList = history.length > 0
        ? `\n\nYou have already used the following messages — do NOT repeat or closely paraphrase any of them:\n${history.map((h, i) => `${i + 1}. "${h.message}"`).join('\n')}`
        : '';

    const prompt = `Today is ${today}. Generate a short (1-2 sentences max), insightful or witty message for a developer portfolio — draw inspiration from something that happened on this date in history, or a relevant tech/science/culture event. Just the message, no preamble.${avoidList}`;

    const genAI = new GoogleGenerativeAI(apiKey);

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

                // Hard check: reject if it exactly matches any historical message
                const isDuplicate = history.some(
                    h => h.message.toLowerCase() === cleaned.toLowerCase()
                );
                if (isDuplicate) {
                    console.warn(`${modelName} returned a duplicate message, trying next...`);
                    continue;
                }

                await writeOutput(outputPath, cleaned, previousMessage, history);
                console.log(`Success with ${modelName}: ${cleaned}`);
                return;
            }

            console.warn(`${modelName} returned empty response, trying next...`);
        } catch (err) {
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

    console.error("ERROR: All models failed. No MOTD generated.");
    process.exit(1);
}

async function writeOutput(targetPath, newMessage, previousMessage, existingHistory) {
    // Push the outgoing current message into history before replacing it
    const updatedHistory = [...existingHistory];
    if (previousMessage) {
        // Avoid duplicates in history itself
        const alreadyInHistory = updatedHistory.some(h => h.message === previousMessage);
        if (!alreadyInHistory) {
            updatedHistory.push({
                message: previousMessage,
                date: new Date().toISOString().split('T')[0]
            });
        }
    }

    const finalOutput = {
        message: newMessage,
        lastUpdated: new Date().toISOString(),
        status: "success",
        history: updatedHistory
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
