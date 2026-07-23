"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const chat_service_1 = require("../services/chat-service");
(0, vitest_1.describe)('ChatService', () => {
    let ollamaClient;
    let retriever;
    let repo;
    let service;
    (0, vitest_1.beforeEach)(() => {
        ollamaClient = {
            embed: vitest_1.vi.fn(),
            chat: vitest_1.vi.fn()
        };
        retriever = {
            search: vitest_1.vi.fn()
        };
        repo = {
            findOwnedConversation: vitest_1.vi.fn(),
            saveUserMessage: vitest_1.vi.fn(),
            saveAIMessageIfModeAI: vitest_1.vi.fn(),
            requestHumanHandoff: vitest_1.vi.fn(),
            createConversation: vitest_1.vi.fn(),
            getActiveKnowledgeVersion: vitest_1.vi.fn(),
            getAiSettings: vitest_1.vi.fn()
        };
        service = new chat_service_1.ChatService(ollamaClient, retriever, repo);
    });
    const defaultSettings = {
        enabled: true,
        embeddingModel: 'test-embed',
        baseUrl: 'http://localhost',
        apiKey: '',
        retrievalCount: 5,
        minRelevanceScore: 0.7,
        fallbackMessage: 'Fallback trigger',
        modelName: 'deepseek-r1:7b',
        temperature: 0.1
    };
    (0, vitest_1.it)('should return fallback if no knowledge version is active', async () => {
        repo.findOwnedConversation.mockResolvedValue({ id: 'c1', mode: 'AI' });
        repo.getAiSettings.mockResolvedValue(defaultSettings);
        repo.getActiveKnowledgeVersion.mockResolvedValue(null);
        repo.saveAIMessageIfModeAI.mockResolvedValue(true);
        const res = await service.processUserMessage('c1', 'v1', 'Hello');
        (0, vitest_1.expect)(res.ai_generated).toBe(true);
        (0, vitest_1.expect)(res.message.content).toBe('Fallback trigger');
        (0, vitest_1.expect)(ollamaClient.embed).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('should return grounded structured answer when context matches', async () => {
        repo.findOwnedConversation.mockResolvedValue({ id: 'c1', mode: 'AI' });
        repo.getAiSettings.mockResolvedValue(defaultSettings);
        repo.getActiveKnowledgeVersion.mockResolvedValue('v1');
        repo.saveAIMessageIfModeAI.mockResolvedValue(true);
        ollamaClient.embed.mockResolvedValue([0.1, 0.2]);
        retriever.search.mockResolvedValue([{ chunkId: 'chk1', content: 'We provide IT services.', normalisedRelevance: 0.9 }]);
        ollamaClient.chat.mockResolvedValue(JSON.stringify({
            answer: "We provide IT services.",
            supportedChunkIds: ["chk1"],
            grounded: true,
            handoffRecommended: false
        }));
        const res = await service.processUserMessage('c1', 'v1', 'What do you do?');
        (0, vitest_1.expect)(res.ai_generated).toBe(true);
        (0, vitest_1.expect)(res.message.content).toBe('We provide IT services.');
        (0, vitest_1.expect)(res.message.grounded).toBe(true);
    });
    (0, vitest_1.it)('should fallback when supportedChunkIds are hallucinated', async () => {
        repo.findOwnedConversation.mockResolvedValue({ id: 'c1', mode: 'AI' });
        repo.getAiSettings.mockResolvedValue(defaultSettings);
        repo.getActiveKnowledgeVersion.mockResolvedValue('v1');
        repo.saveAIMessageIfModeAI.mockResolvedValue(true);
        ollamaClient.embed.mockResolvedValue([0.1, 0.2]);
        retriever.search.mockResolvedValue([{ chunkId: 'chk1', content: 'We provide IT services.', normalisedRelevance: 0.9 }]);
        ollamaClient.chat.mockResolvedValue(JSON.stringify({
            answer: "We also provide cleaning services.",
            supportedChunkIds: ["fake-chk-999"], // Hallucinated
            grounded: true,
            handoffRecommended: false
        }));
        const res = await service.processUserMessage('c1', 'v1', 'What do you do?');
        (0, vitest_1.expect)(res.message.content).toBe('Fallback trigger');
    });
    (0, vitest_1.it)('should strip <think> tokens before parsing JSON', async () => {
        repo.findOwnedConversation.mockResolvedValue({ id: 'c1', mode: 'AI' });
        repo.getAiSettings.mockResolvedValue(defaultSettings);
        repo.getActiveKnowledgeVersion.mockResolvedValue('v1');
        repo.saveAIMessageIfModeAI.mockResolvedValue(true);
        ollamaClient.embed.mockResolvedValue([0.1, 0.2]);
        retriever.search.mockResolvedValue([{ chunkId: 'chk1', content: 'Data', normalisedRelevance: 0.9 }]);
        ollamaClient.chat.mockResolvedValue(`<think> Let me think about this... </think>\n` + JSON.stringify({
            answer: "Processed answer.",
            supportedChunkIds: ["chk1"],
            grounded: true,
            handoffRecommended: false
        }));
        const res = await service.processUserMessage('c1', 'v1', 'Data?');
        (0, vitest_1.expect)(res.message.content).toBe('Processed answer.');
    });
    (0, vitest_1.it)('should not save AI message if mode changed to HUMAN during generation (atomic handoff race condition)', async () => {
        repo.findOwnedConversation.mockResolvedValue({ id: 'c1', mode: 'AI' });
        repo.getAiSettings.mockResolvedValue(defaultSettings);
        repo.getActiveKnowledgeVersion.mockResolvedValue('v1');
        // Simulate conditional save failing because transaction saw mode=HUMAN
        repo.saveAIMessageIfModeAI.mockResolvedValue(false);
        ollamaClient.embed.mockResolvedValue([0.1, 0.2]);
        retriever.search.mockResolvedValue([{ chunkId: 'chk1', content: 'Data', normalisedRelevance: 0.9 }]);
        ollamaClient.chat.mockResolvedValue(JSON.stringify({
            answer: "I am AI.",
            supportedChunkIds: ["chk1"],
            grounded: true,
            handoffRecommended: false
        }));
        const res = await service.processUserMessage('c1', 'v1', 'Hi');
        (0, vitest_1.expect)(res.ai_generated).toBe(false);
        (0, vitest_1.expect)(res.reason).toBe('human_takeover_during_generation');
    });
});
