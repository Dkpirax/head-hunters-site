"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicTawkSettingsRouter = exports.tawkSettingsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../../middleware/auth");
const crypto_1 = __importDefault(require("crypto"));
exports.tawkSettingsRouter = (0, express_1.Router)();
exports.publicTawkSettingsRouter = (0, express_1.Router)();
const algorithm = 'aes-256-ctr';
const secretKey = (process.env.AUTH_SECRET || 'fallback_secret_must_be_32_bytes_long_').padEnd(32, '0').slice(0, 32);
function encrypt(text) {
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}
let publicCache = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
function getEnvFallback() {
    return {
        enabled: process.env.TAWK_ENABLED?.trim().toLowerCase() === 'true',
        propertyId: process.env.TAWK_PROPERTY_ID || process.env.VITE_TAWK_PROPERTY_ID || '',
        widgetId: process.env.TAWK_WIDGET_ID || process.env.VITE_TAWK_WIDGET_ID || '',
        expiresAt: Date.now() + CACHE_TTL_MS,
    };
}
function invalidateCache() {
    publicCache = null;
}
async function getTawkSettingsFromDb() {
    // First try the dedicated tawk_settings key (new)
    const tawkRows = await db_1.db.select().from(schema_1.content).where((0, drizzle_orm_1.eq)(schema_1.content.key, 'tawk_settings'));
    if (tawkRows.length > 0) {
        return JSON.parse(tawkRows[0].value);
    }
    // Migration fallback: read from the old ai_settings key (where Tawk IDs lived before)
    const aiRows = await db_1.db.select().from(schema_1.content).where((0, drizzle_orm_1.eq)(schema_1.content.key, 'ai_settings'));
    if (aiRows.length > 0) {
        const ai = JSON.parse(aiRows[0].value);
        // Only return if it has actual Tawk credentials stored
        if (ai.tawkPropertyId || ai.tawkWidgetId) {
            return {
                tawkEnabled: ai.tawkEnabled ?? (ai.humanSupportProvider === 'TAWK'),
                tawkPropertyId: ai.tawkPropertyId || '',
                tawkWidgetId: ai.tawkWidgetId || '',
            };
        }
    }
    return null;
}
async function resolvePublicSettings() {
    // 1. Return from cache if still valid
    if (publicCache && Date.now() < publicCache.expiresAt) {
        return publicCache;
    }
    // 2. Try to read from database
    try {
        const dbSettings = await getTawkSettingsFromDb();
        if (dbSettings) {
            const hasCredentials = !!(dbSettings.tawkPropertyId && dbSettings.tawkWidgetId);
            // If the DB has credentials but enabled=false, allow TAWK_ENABLED env var to activate them.
            // This handles the case where the admin never explicitly toggled Tawk on in the old AI settings page.
            const envEnabled = process.env.TAWK_ENABLED?.trim().toLowerCase() === 'true';
            const enabled = !!dbSettings.tawkEnabled || (hasCredentials && envEnabled);
            publicCache = {
                enabled,
                propertyId: dbSettings.tawkPropertyId || '',
                widgetId: dbSettings.tawkWidgetId || '',
                expiresAt: Date.now() + CACHE_TTL_MS,
            };
            return publicCache;
        }
    }
    catch (err) {
        // 3. Log once and fall through to environment fallback — DB failure must not block the widget
        console.warn('[tawk-settings] DB unavailable, using environment fallback:', err.message);
    }
    // 4. Use server environment variables as fallback
    const fallback = getEnvFallback();
    publicCache = fallback;
    return fallback;
}
// ── PUBLIC endpoint — no auth required, cached, never exposes secrets ─────────
exports.publicTawkSettingsRouter.get('/', async (req, res) => {
    try {
        const settings = await resolvePublicSettings();
        res.json({
            enabled: settings.enabled,
            propertyId: settings.propertyId,
            widgetId: settings.widgetId,
        });
    }
    catch (error) {
        // Last-resort: return env values so Tawk still loads
        const fallback = getEnvFallback();
        res.json({
            enabled: fallback.enabled,
            propertyId: fallback.propertyId,
            widgetId: fallback.widgetId,
        });
    }
});
// ── ADMIN GET ─────────────────────────────────────────────────────────────────
exports.tawkSettingsRouter.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const dbSettings = await getTawkSettingsFromDb();
        const settings = dbSettings || {
            tawkEnabled: process.env.TAWK_ENABLED?.trim().toLowerCase() === 'true',
            tawkPropertyId: process.env.TAWK_PROPERTY_ID || '',
            tawkWidgetId: process.env.TAWK_WIDGET_ID || '',
            tawkSecureModeEnabled: false,
            tawkHumanHandoffEnabled: true,
            tawkWhatsAppFallbackEnabled: true,
            tawkWhatsAppNumber: '',
            tawkOfflineMessage: '',
        };
        const tawkSecretConfigured = !!settings.tawkSecret;
        if (tawkSecretConfigured) {
            settings.tawkSecret = undefined;
        }
        res.json({ ...settings, tawkSecretConfigured });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ── ADMIN PUT — invalidates cache on save ─────────────────────────────────────
exports.tawkSettingsRouter.put('/', auth_1.requireAuth, async (req, res) => {
    try {
        const data = req.body;
        const dbSettings = await getTawkSettingsFromDb();
        let existingSettings = dbSettings || {};
        if (data.removeTawkSecret) {
            delete existingSettings.tawkSecret;
        }
        else if (data.tawkSecret && data.tawkSecret !== '••••••••') {
            existingSettings.tawkSecret = encrypt(data.tawkSecret);
        }
        delete data.tawkSecret;
        delete data.removeTawkSecret;
        delete data.tawkSecretConfigured;
        const newSettings = { ...existingSettings, ...data };
        await db_1.db.insert(schema_1.content)
            .values({ key: 'tawk_settings', value: JSON.stringify(newSettings) })
            .onDuplicateKeyUpdate({ set: { value: JSON.stringify(newSettings) } });
        // Immediately invalidate public cache so next request picks up new values
        invalidateCache();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
