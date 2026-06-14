const fs = require('fs');
const path = require('path');
const https = require('https');

async function callClaude(apiKey, prompt) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 256,
            messages: [{ role: 'user', content: prompt }]
        });

        const req = https.request({
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
                'content-length': Buffer.byteLength(body)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode !== 200) {
                        reject(new Error(`Claude API error ${res.statusCode}: ${data}`));
                    } else {
                        resolve(parsed.content?.[0]?.text || '');
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function generateMOTD() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const outputPath = path.join(__dirname, '..', 'public', 'motd.json');

    if (!apiKey) {
        console.error("ERROR: ANTHROPIC_API_KEY not found.");
        process.exit(1);
    }

    let previousMessage = null;
    let history = [];
    try {
        const existing = JSON.parse(await fs.promises.readFile(outputPath, 'utf8'));
        if (existing?.message) previousMessage = existing.message;
        if (Array.isArray(existing?.history)) history = existing.history;

        // Already updated today — skip
        if (existing?.lastUpdated) {
            const serverDate = existing.lastUpdated.slice(0, 10);
            const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Kiritimati' });
            if (serverDate === todayDate) {
                console.log("MOTD already up to date for today. Skipping Claude backup.");
                return;
            }
        }
    } catch {
        // File doesn't exist yet, that's fine
    }

    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'Pacific/Kiritimati' });

    const avoidList = history.length > 0
        ? `\n\nYou have already used the following messages — do NOT repeat or closely paraphrase any of them:\n${history.map((h, i) => `${i + 1}. "${h.message}"`).join('\n')}`
        : '';

    const prompt = `Today is ${today}. Generate a short (1-2 sentences max), insightful or witty message for a developer portfolio — draw inspiration from something that happened on this date in history, or a relevant tech/science/culture event. Just the message, no preamble.${avoidList}`;

    const historySet = new Set(history.map(h => h.message.toLowerCase()));

    console.log("Attempting: claude-haiku-4-5-20251001...");
    const message = await callClaude(apiKey, prompt);

    if (!message.trim()) {
        console.error("ERROR: Claude returned empty response.");
        process.exit(1);
    }

    const cleaned = message.trim().replace(/^["']|["']$/g, '');

    if (historySet.has(cleaned.toLowerCase())) {
        console.error("ERROR: Claude returned a duplicate message.");
        process.exit(1);
    }

    await writeOutput(outputPath, cleaned, previousMessage, history);
    console.log(`Success with Claude: ${cleaned}`);
}

async function writeOutput(targetPath, newMessage, previousMessage, existingHistory) {
    const updatedHistory = [...existingHistory];
    if (previousMessage) {
        const alreadyInHistory = updatedHistory.some(h => h.message === previousMessage);
        if (!alreadyInHistory) {
            updatedHistory.push({
                message: previousMessage,
                date: new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Kiritimati' })
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
