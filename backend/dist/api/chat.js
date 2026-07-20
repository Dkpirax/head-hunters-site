"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const db_1 = require("../lib/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const vector_store_1 = require("../lib/vector-store");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const groundedAnswerSchema = zod_1.z.object({
    answer: zod_1.z.string().trim().min(1).max(3000),
    supportedChunkIds: zod_1.z.array(zod_1.z.string()).min(1),
    grounded: zod_1.z.literal(true),
    handoffRecommended: zod_1.z.boolean()
});
exports.chatRouter = (0, express_1.Router)();
const visitorTokenSecret = process.env.VISITOR_TOKEN_SECRET || 'dev_secret_only_for_local_testing_purposes';
function getOrCreateVisitorToken(req, res) {
    let token = req.cookies.visitor_token;
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, visitorTokenSecret, { audience: 'headhunters-chat', issuer: 'headhunters-backend' });
            if (decoded && decoded.sub) {
                return decoded.sub;
            }
        }
        catch (e) {
            // Invalid token, fall through to create a new one
        }
    }
    const visitorId = crypto_1.default.randomUUID();
    token = jsonwebtoken_1.default.sign({ type: 'visitor' }, visitorTokenSecret, {
        subject: visitorId,
        audience: 'headhunters-chat',
        issuer: 'headhunters-backend',
        expiresIn: '30d'
    });
    res.cookie('visitor_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
    return visitorId;
}
function verifyVisitorToken(req, res, next) {
    const token = req.cookies.visitor_token;
    if (!token)
        return res.status(401).json({ error: 'Unauthorized: Missing visitor token' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, visitorTokenSecret, { audience: 'headhunters-chat', issuer: 'headhunters-backend' });
        if (decoded && decoded.sub) {
            req.visitorId = decoded.sub;
            return next();
        }
    }
    catch (e) {
        return res.status(401).json({ error: 'Unauthorized: Invalid visitor token' });
    }
    return res.status(401).json({ error: 'Unauthorized' });
}
const algorithm = 'aes-256-ctr';
const secretKey = (process.env.AUTH_SECRET || 'fallback_secret_must_be_32_bytes_long_').padEnd(32, '0').slice(0, 32);
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
async function getAiSettings() {
    const rows = await db_1.db.select().from(schema_1.content).where((0, drizzle_orm_1.eq)(schema_1.content.key, 'ai_settings'));
    let settings = {};
    if (rows.length > 0) {
        settings = JSON.parse(rows[0].value);
    }
    return {
        enabled: settings.enabled ?? true,
        baseUrl: settings.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        modelName: settings.modelName || process.env.OLLAMA_MODEL || 'deepseek-r1:7b',
        embeddingModel: settings.embeddingModel || process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
        temperature: settings.temperature ?? 0.1,
        apiKey: settings.apiKey ? decrypt(settings.apiKey) : null,
        retrievalCount: settings.retrievalCount ?? 5,
        minRelevanceScore: settings.minRelevanceScore ?? 0.70,
        fallbackMessage: settings.fallbackMessage || "I’m sorry, but I could not find that information in the approved Headhunters.lk information. Please contact our team at info@headhunters.lk or WhatsApp/call +94 77 397 5048.",
        humanSupportProvider: settings.humanSupportProvider || "INTERNAL",
        tawkEnabled: settings.tawkEnabled ?? false,
        tawkPropertyId: settings.tawkPropertyId || "",
        tawkWidgetId: settings.tawkWidgetId || "",
        tawkSecureModeEnabled: settings.tawkSecureModeEnabled ?? false,
        tawkSecretConfigured: !!settings.tawkSecret,
        tawkWhatsAppFallbackEnabled: settings.tawkWhatsAppFallbackEnabled ?? true,
        tawkWhatsAppNumber: settings.tawkWhatsAppNumber || "94773975048",
        tawkOfflineMessage: settings.tawkOfflineMessage || "Our recruitment team is currently offline. You can leave a message, continue with the AI assistant, or contact us on WhatsApp.",
        tawkBusinessHours: settings.tawkBusinessHours || "Mon-Fri 9AM-5PM",
    };
}
exports.chatRouter.get('/config', async (req, res) => {
    try {
        const settings = await getAiSettings();
        res.json({
            tawkEnabled: settings.tawkEnabled,
            tawkPropertyId: settings.tawkPropertyId,
            tawkWidgetId: settings.tawkWidgetId,
            humanSupportProvider: settings.humanSupportProvider,
            tawkWhatsAppFallbackEnabled: settings.tawkWhatsAppFallbackEnabled,
            tawkWhatsAppNumber: settings.tawkWhatsAppNumber,
            tawkOfflineMessage: settings.tawkOfflineMessage,
            tawkBusinessHours: settings.tawkBusinessHours
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.chatRouter.post('/conversations', async (req, res) => {
    try {
        const visitorId = getOrCreateVisitorToken(req, res);
        const existingConvs = await db_1.db.select()
            .from(schema_1.conversation)
            .where((0, drizzle_orm_1.eq)(schema_1.conversation.userId, visitorId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.conversation.updatedAt))
            .limit(1);
        const existingConv = existingConvs[0];
        if (existingConv && existingConv.chatStatus !== 'RESOLVED') {
            const messages = await db_1.db.select()
                .from(schema_1.message)
                .where((0, drizzle_orm_1.eq)(schema_1.message.conversationId, existingConv.id))
                .orderBy(schema_1.message.createdAt);
            return res.json({ ...existingConv, messages });
        }
        const setRows = await db_1.db.select().from(schema_1.content).where((0, drizzle_orm_1.eq)(schema_1.content.key, 'chatbot_greeting')).limit(1);
        const greetingText = setRows[0]?.value || "Welcome to Head Hunters. I am your assistant. How can I help you today?";
        const { newConv, botGreeting } = await db_1.db.transaction(async (tx) => {
            const conversationId = crypto_1.default.randomUUID();
            const greetingId = crypto_1.default.randomUUID();
            await tx.insert(schema_1.conversation).values({
                id: conversationId,
                userId: visitorId,
                mode: 'AI',
                chatStatus: 'OPEN',
                status: 'BOT_ACTIVE', // Legacy fallback
            });
            await tx.insert(schema_1.message).values({
                id: greetingId,
                conversationId,
                senderType: 'BOT', // Legacy fallback
                sender: 'AI',
                content: greetingText,
            });
            const [c] = await tx.select().from(schema_1.conversation).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, conversationId)).limit(1);
            const [m] = await tx.select().from(schema_1.message).where((0, drizzle_orm_1.eq)(schema_1.message.id, greetingId)).limit(1);
            return { newConv: c, botGreeting: m };
        });
        return res.json({ ...newConv, messages: [botGreeting] });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.chatRouter.post('/conversations/:id/refresh', async (req, res) => {
    try {
        const { id } = req.params;
        const setRows = await db_1.db.select().from(schema_1.content).where((0, drizzle_orm_1.eq)(schema_1.content.key, 'chatbot_greeting')).limit(1);
        const greetingText = setRows[0]?.value || "Welcome to Head Hunters. I am your assistant. How can I help you today?";
        const greetingId = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.message).values({
            id: greetingId,
            conversationId: id,
            senderType: 'BOT',
            sender: 'AI',
            content: greetingText,
        });
        const [m] = await db_1.db.select().from(schema_1.message).where((0, drizzle_orm_1.eq)(schema_1.message.id, greetingId)).limit(1);
        return res.json(m);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.chatRouter.post('/conversations/:id/messages', verifyVisitorToken, async (req, res) => {
    try {
        const { id } = req.params;
        const visitorId = req.visitorId;
        const { content: msgContent } = req.body; // Always from USER
        if (!msgContent)
            return res.status(400).json({ error: 'Message content required' });
        // Ensure conversation exists and is owned by the visitor
        let [conv] = await db_1.db.select().from(schema_1.conversation).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id))).limit(1);
        if (!conv || conv.userId !== visitorId)
            return res.status(404).json({ error: 'Conversation not found' });
        // Insert user message
        await db_1.db.insert(schema_1.message).values([{
                conversationId: String(id),
                senderType: 'USER',
                sender: 'USER',
                content: msgContent,
            }]);
        // Update conv timestamp
        await db_1.db.update(schema_1.conversation).set({ updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id)));
        if (conv.mode !== 'AI') {
            return res.json({ success: true, ai_generated: false });
        }
        // AI Generation
        const startTime = Date.now();
        const settings = await getAiSettings();
        if (!settings.enabled) {
            return res.json({ success: true, ai_generated: false });
        }
        // Determine Approved Document
        const [approvedDoc] = await db_1.db.select().from(schema_1.knowledgeDocument).where((0, drizzle_orm_1.eq)(schema_1.knowledgeDocument.status, 'APPROVED')).limit(1);
        let finalAnswer = settings.fallbackMessage;
        let grounded = false;
        let retrievedChunkIds = [];
        if (approvedDoc) {
            try {
                const headers = { "Content-Type": "application/json" };
                if (settings.apiKey)
                    headers["Authorization"] = `Bearer ${settings.apiKey}`;
                // Get Embedding
                const embedRes = await fetch(`${settings.baseUrl}/api/embed`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        model: settings.embeddingModel,
                        input: msgContent
                    })
                });
                if (embedRes.ok) {
                    const embedData = await embedRes.json();
                    const queryVector = embedData.embeddings[0];
                    // LanceDB search
                    const results = await (0, vector_store_1.searchKnowledge)(approvedDoc.version, queryVector, settings.retrievalCount);
                    const relevantChunks = results.filter((r) => r.normalisedRelevance >= settings.minRelevanceScore);
                    if (relevantChunks.length > 0) {
                        retrievedChunkIds = relevantChunks.map((r) => r.chunkId);
                        const contextText = relevantChunks.map((r) => `[Chunk: ${r.chunkId}]\n${r.content}`).join('\n\n');
                        const systemPrompt = `You are a helpful assistant for Headhunters.lk. Answer the user's question using ONLY the provided knowledge chunks below. 
If the answer is not contained in the knowledge chunks, you MUST NOT guess or use outside knowledge; recommend human handoff instead.
Respond strictly in JSON format as follows:
{
  "answer": "Final user-facing response",
  "supportedChunkIds": ["chunk-id-1"],
  "grounded": true,
  "handoffRecommended": false
}

Knowledge Chunks:
${contextText}`;
                        // Generate AI Answer
                        const chatRes = await fetch(`${settings.baseUrl}/api/chat`, {
                            method: "POST",
                            headers,
                            body: JSON.stringify({
                                model: settings.modelName,
                                messages: [
                                    { role: "system", content: systemPrompt },
                                    { role: "user", content: msgContent }
                                ],
                                format: "json",
                                options: { temperature: settings.temperature },
                                stream: false
                            })
                        });
                        if (chatRes.ok) {
                            const chatData = await chatRes.json();
                            let aiContent = chatData.message.content;
                            // DeepSeek-R1 strip <think>
                            aiContent = aiContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                            try {
                                const parsed = JSON.parse(aiContent);
                                const validated = groundedAnswerSchema.parse(parsed);
                                // Verify that supportedChunkIds are actually in retrievedChunkIds
                                const valid = validated.supportedChunkIds.every((chunkId) => retrievedChunkIds.includes(chunkId));
                                if (valid) {
                                    finalAnswer = validated.answer;
                                    grounded = true;
                                    if (validated.handoffRecommended) {
                                        // Handoff requested by AI
                                        await db_1.db.update(schema_1.conversation).set({
                                            mode: 'HUMAN',
                                            chatStatus: 'WAITING_FOR_ADMIN',
                                            needsHuman: true // legacy
                                        }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id)));
                                    }
                                }
                                else {
                                    console.warn("AI used hallucinated chunk IDs:", validated.supportedChunkIds);
                                }
                            }
                            catch (parseError) {
                                console.error("AI returned invalid JSON or schema mismatch:", aiContent);
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error("AI Error:", error);
            }
        }
        // Atomic conversation state check and insert using a transaction
        const saved = await db_1.db.transaction(async (tx) => {
            // Locking the conversation row to prevent race conditions during human handoff
            const [recheckConv] = await tx.execute((0, drizzle_orm_1.sql) `SELECT mode FROM Conversation WHERE id = ${id} FOR UPDATE`);
            // Fallback in case raw SQL execute behaves differently, or if we just use drizzle select
            const [dbConv] = await tx.select().from(schema_1.conversation).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id))).limit(1);
            if (dbConv && dbConv.mode === 'AI') {
                const aiMsgId = crypto_1.default.randomUUID();
                await tx.insert(schema_1.message).values([{
                        id: aiMsgId,
                        conversationId: String(id),
                        senderType: 'BOT',
                        sender: 'AI',
                        content: finalAnswer,
                        grounded,
                        retrievedChunkIds: JSON.stringify(retrievedChunkIds),
                        modelName: settings.modelName,
                        latencyMs: Date.now() - startTime,
                    }]);
                await tx.update(schema_1.conversation).set({ updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id)));
                const [newMsg] = await tx.select().from(schema_1.message).where((0, drizzle_orm_1.eq)(schema_1.message.id, aiMsgId)).limit(1);
                return newMsg;
            }
            return null;
        });
        if (saved) {
            return res.json({ success: true, ai_generated: true, message: saved });
        }
        else {
            return res.json({ success: true, ai_generated: false });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.chatRouter.post('/conversations/:id/request-human', verifyVisitorToken, async (req, res) => {
    try {
        const { id } = req.params;
        const visitorId = req.visitorId;
        let [conv] = await db_1.db.select().from(schema_1.conversation).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id))).limit(1);
        if (!conv || conv.userId !== visitorId)
            return res.status(404).json({ error: 'Conversation not found' });
        await db_1.db.update(schema_1.conversation).set({
            mode: 'HUMAN',
            chatStatus: 'WAITING_FOR_ADMIN',
            needsHuman: true,
            updatedAt: new Date()
        }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id)));
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.chatRouter.post('/conversations/:id/resolve', verifyVisitorToken, async (req, res) => {
    try {
        const { id } = req.params;
        const visitorId = req.visitorId;
        let [conv] = await db_1.db.select().from(schema_1.conversation).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id))).limit(1);
        if (!conv || conv.userId !== visitorId)
            return res.status(404).json({ error: 'Conversation not found' });
        await db_1.db.update(schema_1.conversation).set({
            mode: 'CLOSED',
            chatStatus: 'RESOLVED',
            status: 'CLOSED',
            needsHuman: false,
        }).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id)));
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.chatRouter.get('/messages', verifyVisitorToken, async (req, res) => {
    try {
        const { conversationId } = req.query;
        const visitorId = req.visitorId;
        if (!conversationId || typeof conversationId !== 'string')
            return res.status(400).json({ error: 'conversationId required' });
        const { asc } = await Promise.resolve().then(() => __importStar(require('drizzle-orm')));
        const [conv] = await db_1.db.select().from(schema_1.conversation).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, conversationId)).limit(1);
        if (!conv || conv.userId !== visitorId)
            return res.status(404).json({ error: 'Conversation not found' });
        const msgs = await db_1.db.select().from(schema_1.message).where((0, drizzle_orm_1.eq)(schema_1.message.conversationId, conversationId)).orderBy(asc(schema_1.message.createdAt));
        res.json({
            mode: conv.mode,
            chatStatus: conv.chatStatus,
            assignedAdminId: conv.assignedAdminId,
            status: conv.status,
            takenBy: conv.takenBy,
            messages: msgs
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.chatRouter.post('/conversations/:id/tawk-identity', verifyVisitorToken, async (req, res) => {
    try {
        const { id } = req.params;
        const visitorId = req.visitorId;
        let [conv] = await db_1.db.select().from(schema_1.conversation).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id))).limit(1);
        if (!conv || conv.userId !== visitorId)
            return res.status(404).json({ error: 'Conversation not found' });
        const settings = await getAiSettings();
        if (!settings.tawkEnabled) {
            return res.status(400).json({ enabled: false, error: 'Tawk.to integration disabled' });
        }
        const visitorInfo = req.body; // e.g. { name, email, phone }
        if (!visitorInfo.email && !visitorInfo.name) {
            return res.status(400).json({ error: 'Missing identity data' });
        }
        const payload = {
            enabled: true,
            propertyId: settings.tawkPropertyId,
            widgetId: settings.tawkWidgetId,
            visitor: {
                name: visitorInfo.name,
                email: visitorInfo.email,
                phone: visitorInfo.phone,
            }
        };
        if (settings.tawkSecureModeEnabled && settings.tawkSecretConfigured) {
            // Need to retrieve the actual secret to sign
            const rows = await db_1.db.select().from(schema_1.content).where((0, drizzle_orm_1.eq)(schema_1.content.key, 'ai_settings'));
            if (rows.length > 0) {
                const rawSettings = JSON.parse(rows[0].value);
                if (rawSettings.tawkSecret) {
                    const actualSecret = decrypt(rawSettings.tawkSecret);
                    if (actualSecret && visitorInfo.email) { // secure mode requires email
                        payload.visitor.hash = crypto_1.default.createHmac('sha256', actualSecret).update(visitorInfo.email).digest('hex');
                    }
                }
            }
        }
        res.json(payload);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.chatRouter.post('/conversations/:id/handoff-status', verifyVisitorToken, async (req, res) => {
    try {
        const { id } = req.params;
        const visitorId = req.visitorId;
        const { status, failureReason } = req.body;
        let [conv] = await db_1.db.select().from(schema_1.conversation).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id))).limit(1);
        if (!conv || conv.userId !== visitorId)
            return res.status(404).json({ error: 'Conversation not found' });
        // Validate transition
        const validTransitions = {
            'OPEN': ['NOT_REQUESTED', 'DETAILS_REQUIRED'],
            'NOT_REQUESTED': ['DETAILS_REQUIRED', 'REQUESTED'],
            'DETAILS_REQUIRED': ['REQUESTED'],
            'REQUESTED': ['TAWK_OPENED', 'OFFLINE', 'FAILED'],
            'TAWK_OPENED': ['AGENT_JOINED', 'COMPLETED', 'FAILED'],
            'AGENT_JOINED': ['COMPLETED']
        };
        const currentStatus = conv.chatStatus || 'OPEN';
        // In some cases we might just allow setting it directly if it's one of the valid statuses
        // For now, allow valid target states
        const validStates = ['NOT_REQUESTED', 'DETAILS_REQUIRED', 'REQUESTED', 'TAWK_OPENED', 'AGENT_JOINED', 'COMPLETED', 'OFFLINE', 'FAILED'];
        if (!validStates.includes(status)) {
            return res.status(400).json({ error: 'Invalid handoff status' });
        }
        const updates = {
            chatStatus: status,
            updatedAt: new Date()
        };
        if (status === 'REQUESTED')
            updates.handoffRequestedAt = new Date();
        if (status === 'TAWK_OPENED')
            updates.tawkOpenedAt = new Date();
        if (status === 'AGENT_JOINED')
            updates.agentJoinedAt = new Date();
        if (status === 'COMPLETED')
            updates.handoffCompletedAt = new Date();
        if (status === 'FAILED')
            updates.handoffFailureReason = failureReason;
        await db_1.db.update(schema_1.conversation).set(updates).where((0, drizzle_orm_1.eq)(schema_1.conversation.id, String(id)));
        res.json({ success: true, status });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
