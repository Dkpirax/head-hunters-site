import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatService } from '../services/chat-service';
import { OllamaClient, KnowledgeRetriever, ConversationRepository } from '../services/chat-interfaces';

describe('ChatService', () => {
  let ollamaClient: import('vitest').Mocked<OllamaClient>;
  let retriever: import('vitest').Mocked<KnowledgeRetriever>;
  let repo: import('vitest').Mocked<ConversationRepository>;
  let service: ChatService;

  beforeEach(() => {
    ollamaClient = {
      embed: vi.fn(),
      chat: vi.fn()
    };
    retriever = {
      search: vi.fn()
    };
    repo = {
      findOwnedConversation: vi.fn(),
      saveUserMessage: vi.fn(),
      saveAIMessageIfModeAI: vi.fn(),
      requestHumanHandoff: vi.fn(),
      createConversation: vi.fn(),
      getActiveKnowledgeVersion: vi.fn(),
      getAiSettings: vi.fn()
    };
    service = new ChatService(ollamaClient, retriever, repo);
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

  it('should return fallback if no knowledge version is active', async () => {
    repo.findOwnedConversation.mockResolvedValue({ id: 'c1', mode: 'AI' });
    repo.getAiSettings.mockResolvedValue(defaultSettings);
    repo.getActiveKnowledgeVersion.mockResolvedValue(null);
    repo.saveAIMessageIfModeAI.mockResolvedValue(true);

    const res = await service.processUserMessage('c1', 'v1', 'Hello');
    expect(res.ai_generated).toBe(true);
    expect(res.message.content).toBe('Fallback trigger');
    expect(ollamaClient.embed).not.toHaveBeenCalled();
  });

  it('should return grounded structured answer when context matches', async () => {
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
    expect(res.ai_generated).toBe(true);
    expect(res.message.content).toBe('We provide IT services.');
    expect(res.message.grounded).toBe(true);
  });

  it('should fallback when supportedChunkIds are hallucinated', async () => {
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
    expect(res.message.content).toBe('Fallback trigger');
  });

  it('should strip <think> tokens before parsing JSON', async () => {
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
    expect(res.message.content).toBe('Processed answer.');
  });

  it('should not save AI message if mode changed to HUMAN during generation (atomic handoff race condition)', async () => {
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
    expect(res.ai_generated).toBe(false);
    expect(res.reason).toBe('human_takeover_during_generation');
  });
});
