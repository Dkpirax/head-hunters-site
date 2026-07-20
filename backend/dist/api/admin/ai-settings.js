"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiSettingsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../../middleware/auth");
exports.aiSettingsRouter = (0, express_1.Router)();
// Encryption helper for the API Key
const algorithm = 'aes-256-ctr';
const secretKey = (process.env.AUTH_SECRET || 'fallback_secret_must_be_32_bytes_long_').padEnd(32, '0').slice(0, 32);
function encrypt(text) {
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}
function decrypt(hash) {
    try {
        const parts = hash.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');
        const decipher = crypto_1.default.createDecipheriv(algorithm, secretKey, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString();
    }
    catch (err) {
        return null;
    }
}
// Get Settings
exports.aiSettingsRouter.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const settingsRows = await db_1.db.select().from(schema_1.content).where((0, drizzle_orm_1.eq)(schema_1.content.key, 'ai_settings'));
        let aiSettings = {};
        if (settingsRows.length > 0) {
            aiSettings = JSON.parse(settingsRows[0].value);
        }
        // Return whether API key and Tawk Secret are configured
        const apiKeyConfigured = !!aiSettings.apiKey;
        const tawkSecretConfigured = !!aiSettings.tawkSecret;
        delete aiSettings.apiKey;
        delete aiSettings.tawkSecret;
        res.json({
            enabled: true,
            provider: 'Ollama',
            baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
            modelName: process.env.OLLAMA_MODEL || 'deepseek-r1:7b',
            embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
            temperature: 0.1,
            maxOutputTokens: 500,
            retrievalCount: 5,
            minRelevanceScore: 0.70,
            fallbackMessage: "I’m sorry, but I could not find that information in the approved Headhunters.lk information. Please contact our team at info@headhunters.lk or WhatsApp/call +94 77 397 5048.",
            humanHandoffEnabled: true,
            humanHandoffMessage: "A team member will be with you shortly.",
            humanSupportProvider: "INTERNAL", // INTERNAL, TAWK, DISABLED
            tawkEnabled: false,
            tawkPropertyId: "",
            tawkWidgetId: "",
            tawkSecureModeEnabled: false,
            tawkHumanHandoffEnabled: true,
            tawkWhatsAppFallbackEnabled: true,
            tawkWhatsAppNumber: "94773975048",
            tawkOfflineMessage: "Our recruitment team is currently offline. You can leave a message, continue with the AI assistant, or contact us on WhatsApp.",
            tawkBusinessHours: "Mon-Fri 9AM-5PM",
            requestTimeout: 60,
            apiKeyConfigured,
            tawkSecretConfigured,
            ...aiSettings
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update Settings
exports.aiSettingsRouter.put('/', auth_1.requireAuth, async (req, res) => {
    try {
        const data = req.body;
        // Load existing settings
        const settingsRows = await db_1.db.select().from(schema_1.content).where((0, drizzle_orm_1.eq)(schema_1.content.key, 'ai_settings'));
        let existingSettings = {};
        if (settingsRows.length > 0) {
            existingSettings = JSON.parse(settingsRows[0].value);
        }
        if (data.removeApiKey) {
            delete existingSettings.apiKey;
            console.log(`[SECURITY AUDIT] API Key removed by admin user: ${req.user?.id || 'unknown'}`);
        }
        else if (data.apiKey) {
            existingSettings.apiKey = encrypt(data.apiKey);
            console.log(`[SECURITY AUDIT] API Key replaced by admin user: ${req.user?.id || 'unknown'}`);
        }
        if (data.removeTawkSecret) {
            delete existingSettings.tawkSecret;
            console.log(`[SECURITY AUDIT] Tawk Secret removed by admin user: ${req.user?.id || 'unknown'}`);
        }
        else if (data.tawkSecret) {
            existingSettings.tawkSecret = encrypt(data.tawkSecret);
            console.log(`[SECURITY AUDIT] Tawk Secret replaced by admin user: ${req.user?.id || 'unknown'}`);
        }
        // Merge other operational settings
        delete data.apiKey;
        delete data.removeApiKey;
        delete data.tawkSecret;
        delete data.removeTawkSecret;
        const newSettings = { ...existingSettings, ...data };
        // Save as JSON inside the `content` table under `ai_settings` key
        await db_1.db.insert(schema_1.content)
            .values({ key: 'ai_settings', value: JSON.stringify(newSettings) })
            .onDuplicateKeyUpdate({ set: { value: JSON.stringify(newSettings) } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Test Connection
exports.aiSettingsRouter.post('/test', auth_1.requireAuth, async (req, res) => {
    try {
        const { baseUrl, apiKey, modelName } = req.body;
        // If apiKey is masked, decode it
        let finalKey = apiKey;
        if (finalKey === '••••••••') {
            const settingsRows = await db_1.db.select().from(schema_1.content).where((0, drizzle_orm_1.eq)(schema_1.content.key, 'ai_settings'));
            if (settingsRows.length > 0) {
                const oldSettings = JSON.parse(settingsRows[0].value);
                finalKey = oldSettings.apiKey ? decrypt(oldSettings.apiKey) : null;
            }
        }
        // Ping Ollama
        const controller = new AbortController();
        const timeout = setTimeout(() => { controller.abort(); }, 5000);
        const headers = { "Content-Type": "application/json" };
        if (finalKey)
            headers["Authorization"] = `Bearer ${finalKey}`;
        const response = await fetch(`${baseUrl}/api/tags`, {
            method: "GET",
            headers,
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (response.ok) {
            const data = await response.json();
            const hasModel = data.models?.some((m) => m.name === modelName || m.name.startsWith(modelName));
            if (!hasModel) {
                return res.json({ success: false, message: `Connected to Ollama, but model '${modelName}' was not found.` });
            }
            return res.json({ success: true, message: `Successfully connected to Ollama and found model '${modelName}'.` });
        }
        else {
            return res.json({ success: false, message: `Ollama returned status: ${response.status} ${response.statusText}` });
        }
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
});
