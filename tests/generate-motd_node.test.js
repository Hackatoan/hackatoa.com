const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { generateMOTD } = require('../scripts/generate-motd');

describe('generateMOTD Script', () => {
    let originalEnv;
    let originalFetch;
    let originalWriteFile;
    let writeFilePath;
    let writtenData;
    let consoleWarnArgs;
    let consoleLogArgs;
    let consoleErrorArgs;
    let originalConsoleWarn;
    let originalConsoleLog;
    let originalConsoleError;

    beforeEach(() => {
        // Save original environment
        originalEnv = process.env.GEMINI_API_KEY;
        originalFetch = global.fetch;
        originalWriteFile = fs.promises.writeFile;

        // Reset variables
        writeFilePath = null;
        writtenData = null;
        consoleWarnArgs = [];
        consoleLogArgs = [];
        consoleErrorArgs = [];

        // Mock console methods
        originalConsoleWarn = global.console.warn;
        originalConsoleLog = global.console.log;
        originalConsoleError = global.console.error;


        global.console.warn = (...args) => consoleWarnArgs.push(args);
        global.console.log = (...args) => consoleLogArgs.push(args);
        global.console.error = (...args) => consoleErrorArgs.push(args);

        // Mock fs.promises.writeFile
        fs.promises.writeFile = async (filePath, data) => {
            writeFilePath = filePath;
            writtenData = JSON.parse(data);
        };
    });

    afterEach(() => {
        // Restore original environment
        process.env.GEMINI_API_KEY = originalEnv;
        global.fetch = originalFetch;
        fs.promises.writeFile = originalWriteFile;

        global.console.warn = originalConsoleWarn;
        global.console.log = originalConsoleLog;
        global.console.error = originalConsoleError;

        if (originalEnv === undefined) {
            delete process.env.GEMINI_API_KEY;
        }
    });

    test('should write fallback message when GEMINI_API_KEY is not set', async () => {
        delete process.env.GEMINI_API_KEY;

        await generateMOTD();

        assert.strictEqual(writtenData.message, 'Stay curious. Keep building.');
        assert.ok(consoleWarnArgs.some(args => args[0].includes('GEMINI_API_KEY not found')));
        assert.strictEqual(path.basename(writeFilePath), 'motd.json');
    });

    test('should write generated message on successful API call', async () => {
        process.env.GEMINI_API_KEY = 'test_key';

        global.fetch = async () => ({
            ok: true,
            json: async () => ({
                candidates: [{
                    content: {
                        parts: [{ text: '"This is a generated test message."' }]
                    }
                }]
            })
        });

        await generateMOTD();

        assert.strictEqual(writtenData.message, 'This is a generated test message.');
        assert.ok(consoleLogArgs.some(args => args[0].includes('Successfully generated MOTD')));
    });

    test('should write fallback message when API returns non-ok status', async () => {
        process.env.GEMINI_API_KEY = 'test_key';

        global.fetch = async () => ({
            ok: false,
            status: 500,
            text: async () => 'Internal Server Error'
        });

        await generateMOTD();

        assert.strictEqual(writtenData.message, 'Stay curious. Keep building.');
        assert.ok(consoleErrorArgs.some(args => args[0].includes('Failed to generate MOTD')));
    });

    test('should write fallback message when message is missing in API response', async () => {
        process.env.GEMINI_API_KEY = 'test_key';

        global.fetch = async () => ({
            ok: true,
            json: async () => ({}) // missing candidates
        });

        await generateMOTD();

        assert.strictEqual(writtenData.message, 'Stay curious. Keep building.');
        assert.ok(consoleErrorArgs.some(args => args[0].includes('Failed to generate MOTD')));
    });

    test('should write fallback message on fetch network error', async () => {
        process.env.GEMINI_API_KEY = 'test_key';

        global.fetch = async () => {
            throw new Error('Network failure');
        };

        await generateMOTD();

        assert.strictEqual(writtenData.message, 'Stay curious. Keep building.');
        assert.ok(consoleErrorArgs.some(args => args[0].includes('Failed to generate MOTD')));
    });
});
