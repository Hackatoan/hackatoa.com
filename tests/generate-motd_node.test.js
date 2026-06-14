const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const proxyquire = require('proxyquire');

describe('generateMOTD Script', () => {
    let originalEnv;
    let originalWriteFile;
    let writeFilePath;
    let writtenData;
    let consoleWarnArgs;
    let consoleLogArgs;
    let consoleErrorArgs;
    let originalConsoleWarn;
    let originalConsoleLog;
    let originalConsoleError;
    let mockGoogleGenerativeAI;
    let generateMOTD;

    beforeEach(() => {
        // Save original environment
        originalEnv = process.env.GEMINI_API_KEY;
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

        mockGoogleGenerativeAI = class {};

        // Use proxyquire to inject the mock SDK
        const mockedModule = proxyquire('../scripts/generate-motd', {
            '@google/generative-ai': { GoogleGenerativeAI: mockGoogleGenerativeAI }
        });
        generateMOTD = mockedModule.generateMOTD;
    });

    afterEach(() => {
        // Restore original environment
        process.env.GEMINI_API_KEY = originalEnv;
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
        assert.ok(consoleErrorArgs.some(args => args[0].includes('GEMINI_API_KEY not found')));
        assert.strictEqual(path.basename(writeFilePath), 'motd.json');
    });

    test('should write generated message on successful API call', async () => {
        process.env.GEMINI_API_KEY = 'test_key';

        mockGoogleGenerativeAI.prototype.getGenerativeModel = function() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => '"This is a generated test message."'
                    }
                })
            };
        };

        await generateMOTD();

        assert.strictEqual(writtenData.message, 'This is a generated test message.');
        assert.ok(consoleLogArgs.some(args => args[0].includes('Success with')));
    });

    test('should write fallback message when API returns an error', async () => {
        process.env.GEMINI_API_KEY = 'test_key';

        mockGoogleGenerativeAI.prototype.getGenerativeModel = function() {
            return {
                generateContent: async () => {
                    throw new Error('API Error');
                }
            };
        };

        await generateMOTD();

        assert.strictEqual(writtenData.message, 'Stay curious. Keep building.');
        assert.ok(consoleErrorArgs.some(args => args[0].includes('Error with gemini-3.1-flash-lite-preview')));
        assert.ok(consoleErrorArgs.some(args => args[0].includes('Error with gemini-3-flash-preview')));
        assert.ok(consoleErrorArgs.some(args => args[0].includes('Error with gemini-2.5-flash')));
        assert.ok(consoleErrorArgs.some(args => args[0].includes('Error with gemini-2.5-flash-lite')));
        assert.ok(consoleErrorArgs.some(args => args[0].includes('All models failed')));
    });

});
