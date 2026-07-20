"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const zod_1 = require("zod");
const groundedAnswerSchema = zod_1.z.object({
    answer: zod_1.z.string().trim().min(1).max(3000),
    supportedChunkIds: zod_1.z.array(zod_1.z.string()).min(1),
    grounded: zod_1.z.literal(true),
    handoffRecommended: zod_1.z.boolean()
});
class ChatService {
    ollamaClient;
    retriever;
    repo;
    constructor(ollamaClient, retriever, repo) {
        this.ollamaClient = ollamaClient;
        this.retriever = retriever;
        this.repo = repo;
    }
    async processUserMessage(conversationId, visitorId, msgContent) {
        const conv = await this.repo.findOwnedConversation(conversationId, visitorId);
        if (!conv) {
            throw new Error('Conversation not found');
        }
        await this.repo.saveUserMessage(conversationId, msgContent);
        if (conv.mode !== 'AI') {
            return { success: true, ai_generated: false };
        }
        const settings = await this.repo.getAiSettings();
        if (!settings.enabled) {
            return { success: true, ai_generated: false };
        }
        const approvedVersion = await this.repo.getActiveKnowledgeVersion();
        let finalAnswer = settings.fallbackMessage;
        let grounded = false;
        let retrievedChunkIds = [];
        let handoffRecommended = false;
        if (approvedVersion) {
            try {
                const queryVector = await this.ollamaClient.embed(msgContent, settings.embeddingModel, settings.baseUrl, settings.apiKey);
                const relevantChunks = await this.retriever.search(approvedVersion, queryVector, settings.retrievalCount);
                const filteredChunks = relevantChunks.filter(c => c.normalisedRelevance >= settings.minRelevanceScore);
                if (filteredChunks.length > 0) {
                    retrievedChunkIds = filteredChunks.map(c => c.chunkId);
                    const contextText = filteredChunks.map(c => `[Chunk: ${c.chunkId}]\n${c.content}`).join('\n\n');
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
                    const aiContentRaw = await this.ollamaClient.chat({
                        model: settings.modelName,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: msgContent }
                        ],
                        format: "json",
                        options: { temperature: settings.temperature },
                        stream: false
                    }, settings.baseUrl, settings.apiKey);
                    // Strip <think> tags
                    const aiContent = aiContentRaw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                    try {
                        const parsed = JSON.parse(aiContent);
                        const validated = groundedAnswerSchema.parse(parsed);
                        const valid = validated.supportedChunkIds.every((chunkId) => retrievedChunkIds.includes(chunkId));
                        if (valid) {
                            finalAnswer = validated.answer;
                            grounded = true;
                            handoffRecommended = validated.handoffRecommended;
                        }
                    }
                    catch (e) {
                        // Invalid JSON or schema mismatch, fallback triggers
                    }
                }
            }
            catch (e) {
                // Ollama error, fallback triggers
            }
        }
        if (handoffRecommended) {
            await this.repo.requestHumanHandoff(conversationId);
        }
        const saved = await this.repo.saveAIMessageIfModeAI(conversationId, finalAnswer, grounded, retrievedChunkIds);
        if (!saved) {
            // It means human takeover happened during generation
            return { success: true, ai_generated: false, reason: "human_takeover_during_generation" };
        }
        return { success: true, ai_generated: true, message: {
                id: crypto.randomUUID(), // we might want to return the actual message from DB but this works for service result
                senderType: 'BOT',
                sender: 'AI',
                content: finalAnswer,
                grounded
            } };
    }
}
exports.ChatService = ChatService;
