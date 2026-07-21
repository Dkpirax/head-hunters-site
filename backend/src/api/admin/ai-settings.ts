import { Router } from 'express';
import { db } from "../../lib/db";
import { content } from "../../db/schema";
import { eq } from "drizzle-orm";
import crypto from 'crypto';
import { requireAuth } from '../../middleware/auth';

export const aiSettingsRouter = Router();

// Encryption helper for the API Key
const algorithm = 'aes-256-ctr';
const secretKey = (process.env.AUTH_SECRET || 'fallback_secret_must_be_32_bytes_long_').padEnd(32, '0').slice(0, 32);

function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(hash: string) {
  try {
    const parts = hash.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    return null;
  }
}

// Get Settings
aiSettingsRouter.get('/', requireAuth, async (req, res) => {
  try {
    const settingsRows = await db.select().from(content).where(eq(content.key, 'ai_settings'));
    let aiSettings: any = {};
    if (settingsRows.length > 0) {
      aiSettings = JSON.parse(settingsRows[0].value);
    }
    
    const apiKeyConfigured = !!aiSettings.apiKey;
    const tawkSecretConfigured = !!aiSettings.tawkSecret;
    
    if (apiKeyConfigured) {
      aiSettings.apiKey = '••••••••';
    }
    if (tawkSecretConfigured) {
      aiSettings.tawkSecret = '••••••••';
    }

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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Settings
aiSettingsRouter.put('/', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    
    // Load existing settings
    const settingsRows = await db.select().from(content).where(eq(content.key, 'ai_settings'));
    let existingSettings: any = {};
    if (settingsRows.length > 0) {
      existingSettings = JSON.parse(settingsRows[0].value);
    }

    if (data.removeApiKey) {
      delete existingSettings.apiKey;
      console.log(`[SECURITY AUDIT] API Key removed by admin user: ${req.user?.id || 'unknown'}`);
    } else if (data.apiKey && data.apiKey !== '••••••••') {
      existingSettings.apiKey = encrypt(data.apiKey);
      console.log(`[SECURITY AUDIT] API Key replaced by admin user: ${req.user?.id || 'unknown'}`);
    }
    
    if (data.removeTawkSecret) {
      delete existingSettings.tawkSecret;
      console.log(`[SECURITY AUDIT] Tawk Secret removed by admin user: ${req.user?.id || 'unknown'}`);
    } else if (data.tawkSecret && data.tawkSecret !== '••••••••') {
      existingSettings.tawkSecret = encrypt(data.tawkSecret);
      console.log(`[SECURITY AUDIT] Tawk Secret replaced by admin user: ${req.user?.id || 'unknown'}`);
    }

    // Clean payload properties before merging
    delete data.apiKey;
    delete data.removeApiKey;
    delete data.tawkSecret;
    delete data.removeTawkSecret;
    delete data.apiKeyConfigured;
    delete data.tawkSecretConfigured;
    
    const newSettings = { ...existingSettings, ...data };

    // Save as JSON inside the `content` table under `ai_settings` key
    await db.insert(content)
      .values({ key: 'ai_settings', value: JSON.stringify(newSettings) })
      .onDuplicateKeyUpdate({ set: { value: JSON.stringify(newSettings) } });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test Connection
aiSettingsRouter.post('/test', requireAuth, async (req, res) => {
  try {
    const { baseUrl, apiKey, modelName } = req.body;
    
    // If apiKey is masked or empty, load decrypted stored key from DB
    let finalKey = apiKey;
    if (!finalKey || finalKey === '••••••••') {
      const settingsRows = await db.select().from(content).where(eq(content.key, 'ai_settings'));
      if (settingsRows.length > 0) {
        const oldSettings = JSON.parse(settingsRows[0].value);
        finalKey = oldSettings.apiKey ? decrypt(oldSettings.apiKey) : null;
      }
    }

    const targetUrl = (baseUrl || 'http://localhost:11434').replace(/\/+$/, '');

    // Ping Ollama
    const controller = new AbortController();
    const timeout = setTimeout(() => { controller.abort(); }, 8000);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (finalKey) headers["Authorization"] = `Bearer ${finalKey}`;

    const response = await fetch(`${targetUrl}/api/tags`, {
      method: "GET",
      headers,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const hasModel = data.models?.some((m: any) => m.name === modelName || m.name.startsWith(modelName));
      if (!hasModel) {
        return res.json({ success: false, message: `Connected to Ollama at ${targetUrl}, but model '${modelName}' was not found in available models.` });
      }
      return res.json({ success: true, message: `Successfully connected to Ollama at ${targetUrl} and found model '${modelName}'.` });
    } else {
      return res.json({ success: false, message: `Ollama at ${targetUrl} returned status ${response.status}: ${response.statusText}` });
    }
  } catch (error: any) {
    res.json({ success: false, message: `Connection failed: ${error.message}` });
  }
});
