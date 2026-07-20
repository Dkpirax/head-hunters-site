export interface OllamaClient {
  embed(input: string, model: string, baseUrl: string, apiKey?: string): Promise<number[]>;
  chat(request: any, baseUrl: string, apiKey?: string): Promise<string>;
}

export interface RetrievedChunk {
  chunkId: string;
  content: string;
  normalisedRelevance: number;
}

export interface KnowledgeRetriever {
  search(version: string, queryVector: number[], topK: number): Promise<RetrievedChunk[]>;
}

export interface ConversationRepository {
  findOwnedConversation(id: string, visitorId: string): Promise<any | null>;
  saveUserMessage(conversationId: string, content: string): Promise<any>;
  saveAIMessageIfModeAI(conversationId: string, aiContent: string, grounded: boolean, chunkIds: string[]): Promise<boolean>;
  requestHumanHandoff(conversationId: string): Promise<void>;
  createConversation(visitorId: string, greetingText: string): Promise<{ newConv: any, botGreeting: any }>;
  getActiveKnowledgeVersion(): Promise<string | null>;
  getAiSettings(): Promise<any>;
}
