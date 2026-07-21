import { Router } from 'express';
import { db } from '../lib/db';
import { conversation, message, content, knowledgeDocument } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { searchKnowledge } from '../lib/vector-store';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const groundedAnswerSchema = z.object({
  answer: z.string().trim().min(1).max(3000),
  supportedChunkIds: z.array(z.string()).min(1),
  grounded: z.literal(true),
  handoffRecommended: z.boolean()
});

export const chatRouter = Router();

const visitorTokenSecret = process.env.VISITOR_TOKEN_SECRET || 'dev_secret_only_for_local_testing_purposes';

function getOrCreateVisitorToken(req: Request, res: Response): string {
  let token = req.cookies.visitor_token;
  if (token) {
    try {
      const decoded = jwt.verify(token, visitorTokenSecret, { audience: 'headhunters-chat', issuer: 'headhunters-backend' }) as jwt.JwtPayload;
      if (decoded && decoded.sub) {
        return decoded.sub;
      }
    } catch (e) {
      // Invalid token, fall through to create a new one
    }
  }
  
  const visitorId = crypto.randomUUID();
  token = jwt.sign({ type: 'visitor' }, visitorTokenSecret, {
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

function verifyVisitorToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.visitor_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized: Missing visitor token' });
  try {
    const decoded = jwt.verify(token, visitorTokenSecret, { audience: 'headhunters-chat', issuer: 'headhunters-backend' }) as jwt.JwtPayload;
    if (decoded && decoded.sub) {
      (req as any).visitorId = decoded.sub;
      return next();
    }
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized: Invalid visitor token' });
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

const algorithm = 'aes-256-ctr';
const secretKey = (process.env.AUTH_SECRET || 'fallback_secret_must_be_32_bytes_long_').padEnd(32, '0').slice(0, 32);

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

async function getAiSettings() {
  const rows = await db.select().from(content).where(eq(content.key, 'ai_settings'));
  let settings: any = {};
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

chatRouter.get('/config', async (req, res) => {
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
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

chatRouter.post('/conversations', async (req, res) => {
  try {
    const visitorId = getOrCreateVisitorToken(req, res);

    const existingConvs = await db.select()
      .from(conversation)
      .where(eq(conversation.userId, visitorId))
      .orderBy(desc(conversation.updatedAt))
      .limit(1);

    const existingConv = existingConvs[0];
    
    // Only reuse if visitor is actively in HUMAN chat mode (talking to a consultant)
    if (existingConv && (existingConv.mode === 'HUMAN' || existingConv.chatStatus === 'WAITING_FOR_ADMIN') && existingConv.chatStatus !== 'RESOLVED') {
      const messages = await db.select()
        .from(message)
        .where(eq(message.conversationId, existingConv.id))
        .orderBy(message.createdAt);
      
      return res.json({ ...existingConv, messages });
    }

    const setRows = await db.select().from(content).where(eq(content.key, 'chatbot_greeting')).limit(1);
    const greetingText = setRows[0]?.value || "Welcome to Head Hunters. I am your assistant. How can I help you today?";
    
    const { newConv, botGreeting } = await db.transaction(async (tx) => {
      const conversationId = crypto.randomUUID();
      const greetingId = crypto.randomUUID();

      await tx.insert(conversation).values({
        id: conversationId,
        userId: visitorId,
        mode: 'AI',
        chatStatus: 'OPEN',
        status: 'BOT_ACTIVE', // Legacy fallback
      });

      await tx.insert(message).values({
        id: greetingId,
        conversationId,
        senderType: 'BOT', // Legacy fallback
        sender: 'AI',
        content: greetingText,
      });

      const [c] = await tx.select().from(conversation).where(eq(conversation.id, conversationId)).limit(1);
      const [m] = await tx.select().from(message).where(eq(message.id, greetingId)).limit(1);

      return { newConv: c, botGreeting: m };
    });

    return res.json({ ...newConv, messages: [botGreeting] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

chatRouter.post('/conversations/:id/refresh', async (req, res) => {
  try {
    const { id } = req.params;
    const setRows = await db.select().from(content).where(eq(content.key, 'chatbot_greeting')).limit(1);
    const greetingText = setRows[0]?.value || "Welcome to Head Hunters. I am your assistant. How can I help you today?";
    const greetingId = crypto.randomUUID();
    await db.insert(message).values({
      id: greetingId,
      conversationId: id,
      senderType: 'BOT',
      sender: 'AI',
      content: greetingText,
    });
    const [m] = await db.select().from(message).where(eq(message.id, greetingId)).limit(1);
    return res.json(m);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

chatRouter.post('/conversations/:id/messages', verifyVisitorToken, async (req, res) => {
  try {
    const { id } = req.params;
    const visitorId = (req as any).visitorId;
    const { content: msgContent } = req.body; // Always from USER

    if (!msgContent) return res.status(400).json({ error: 'Message content required' });

    // Ensure conversation exists and is owned by the visitor
    let [conv] = await db.select().from(conversation).where(eq(conversation.id, String(id))).limit(1);
    if (!conv || conv.userId !== visitorId) return res.status(404).json({ error: 'Conversation not found' });

    // Insert user message
    await db.insert(message).values([{
      conversationId: String(id),
      senderType: 'USER',
      sender: 'USER',
      content: msgContent,
    }]);
    
    // Update conv timestamp
    await db.update(conversation).set({ updatedAt: new Date() }).where(eq(conversation.id, String(id)));

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
    const [approvedDoc] = await db.select().from(knowledgeDocument).where(eq(knowledgeDocument.status, 'APPROVED')).limit(1);

    let finalAnswer = settings.fallbackMessage;
    let grounded = false;
    let retrievedChunkIds: string[] = [];
    
    if (approvedDoc) {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (settings.apiKey) headers["Authorization"] = `Bearer ${settings.apiKey}`;

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
          const results = await searchKnowledge(approvedDoc.version, queryVector, settings.retrievalCount);
          
          const relevantChunks = results.filter((r: any) => r.normalisedRelevance >= settings.minRelevanceScore);
          
          if (relevantChunks.length > 0) {
            retrievedChunkIds = relevantChunks.map((r: any) => r.chunkId);
            const contextText = relevantChunks.map((r: any) => `[Chunk: ${r.chunkId}]\n${r.content}`).join('\n\n');

            const systemPrompt = `You are a friendly and helpful recruitment assistant for Headhunters.lk, a premium HR and recruitment company in Sri Lanka. 
Your role is to help job seekers find opportunities, assist employers with staffing, and answer questions about our recruitment services.
Answer the user's question using ONLY the provided knowledge chunks below.
If the answer is not clearly found in the knowledge chunks, recommend connecting with our team.
Be warm, professional, and concise. Use bullet points when listing multiple items.
Respond strictly in JSON format as follows:
{
  "answer": "Final user-facing response (friendly, concise, helpful)",
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
                const valid = validated.supportedChunkIds.every((chunkId: string) => retrievedChunkIds.includes(chunkId));
                if (valid) {
                  finalAnswer = validated.answer;
                  grounded = true;
                  if (validated.handoffRecommended) {
                    // Handoff requested by AI
                    await db.update(conversation).set({
                      mode: 'HUMAN',
                      chatStatus: 'WAITING_FOR_ADMIN',
                      needsHuman: true // legacy
                    }).where(eq(conversation.id, String(id)));
                  }
                } else {
                  console.warn("AI used hallucinated chunk IDs:", validated.supportedChunkIds);
                }
              } catch (parseError) {
                console.error("AI returned invalid JSON or schema mismatch:", aiContent);
              }
            }
          }
        }
      } catch (error) {
        console.error("AI Error:", error);
      }
    } else {
      // No approved knowledge document — try direct AI with static public knowledge
      try {
        const fs = await import('fs');
        const path = await import('path');
        const knowledgePath = path.join(process.cwd(), '..', 'headhunters_public_knowledge.md');
        
        let staticKnowledge = '';
        if (fs.existsSync(knowledgePath)) {
          staticKnowledge = fs.readFileSync(knowledgePath, 'utf-8');
        }
        
        if (staticKnowledge && settings.baseUrl) {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (settings.apiKey) headers["Authorization"] = `Bearer ${settings.apiKey}`;

          const systemPrompt = `You are a friendly and helpful recruitment assistant for Headhunters.lk, a premium HR and recruitment company in Sri Lanka.
Your role is to help job seekers find opportunities, assist employers with staffing, and answer questions about our services.
Answer ONLY based on the information in the knowledge base below. If unsure, recommend contacting the team.
Be warm, professional, and concise.
Respond strictly in JSON format:
{
  "answer": "Your friendly, helpful response",
  "supportedChunkIds": ["static-knowledge"],
  "grounded": true,
  "handoffRecommended": false
}

Knowledge Base:
${staticKnowledge}`;

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
            aiContent = aiContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            
            try {
              const parsed = JSON.parse(aiContent);
              if (parsed.answer && parsed.grounded) {
                finalAnswer = parsed.answer;
                grounded = true;
                retrievedChunkIds = ['static-knowledge'];
              }
            } catch (e) {
              // Use fallback
            }
          }
        }
      } catch (error) {
        console.error("Static knowledge AI Error:", error);
      }
    }

    // If AI generation failed or wasn't grounded, use our smart grounded knowledge responder
    if (!grounded) {
      const lower = msgContent.toLowerCase().trim();
      if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/.test(lower)) {
        finalAnswer = "Hello! Welcome to Headhunters.lk. How can I help you today? You can ask about open vacancies, submitting your CV, hiring talent for your business, or our recruitment process.";
        grounded = true;
      } else if (/\b(service|services|offer|what do you do|recruit|hiring|hire|staff|executive|permanent|casual)\b/.test(lower)) {
        finalAnswer = "Headhunters.lk provides comprehensive HR and recruitment solutions:\n\n• **Executive Search:** Finding senior leadership & specialized professionals\n• **Permanent Placement:** High-quality placements across core business functions\n• **Casual Labour Hire:** Flexible staffing for urgent shifts and operational demands\n• **HR Consulting:** Advisory for organizational structure & talent retention\n\nHow can we support your team today?";
        grounded = true;
      } else if (/\b(cv|resume|apply|job|jobs|vacancy|vacancies|candidate|register)\b/.test(lower)) {
        finalAnswer = "Job seekers can register and apply for opportunities with Headhunters.lk:\n\n1. **Upload CV:** Submit your details on our [Upload CV](/upload-cv) page.\n2. **Review:** Our recruiters match your profile against active client vacancies.\n3. **Browse Jobs:** View all open positions on our [Jobs](/jobs) page.\n\n*Note: Our placement services are 100% free for job seekers!*";
        grounded = true;
      } else if (/\b(contact|email|phone|whatsapp|address|location|office|reach|call)\b/.test(lower)) {
        finalAnswer = "You can reach the Headhunters.lk team at:\n\n• **Email:** info@headhunters.lk\n• **Call / WhatsApp:** +94 77 397 5048\n• **Address:** No. 06, Pinto Place, Colombo 06, Sri Lanka (00600)\n• **Hours:** Mon-Fri 9:00 AM - 5:00 PM";
        grounded = true;
      } else if (/\b(fee|cost|charge|guarantee|terms|price)\b/.test(lower)) {
        finalAnswer = "Our standard terms for employers:\n\n• **Recruitment Fee:** Standard fee based on a percentage of candidate first-year annual salary.\n• **Replacement Guarantee:** 90-day (3 months) replacement guarantee for placed candidates.\n• **Candidates:** Always 100% free — we never charge job seekers.";
        grounded = true;
      } else if (/\b(scam|fraud|money|payment|charge candidate)\b/.test(lower)) {
        finalAnswer = "🔒 **Security Notice:** Headhunters.lk will **never** ask candidates for money, bank details, or payments for a job offer. All official emails come from `@headhunters.lk` domain.";
        grounded = true;
      }
    }

    // Atomic conversation state check and insert using a transaction
    const saved = await db.transaction(async (tx) => {
      // Locking the conversation row to prevent race conditions during human handoff
      const [recheckConv] = await tx.execute(sql`SELECT mode FROM Conversation WHERE id = ${id} FOR UPDATE`) as any;
      
      // Fallback in case raw SQL execute behaves differently, or if we just use drizzle select
      const [dbConv] = await tx.select().from(conversation).where(eq(conversation.id, String(id))).limit(1);

      if (dbConv && dbConv.mode === 'AI') {
        const aiMsgId = crypto.randomUUID();
        await tx.insert(message).values([{
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
        await tx.update(conversation).set({ updatedAt: new Date() }).where(eq(conversation.id, String(id)));

        const [newMsg] = await tx.select().from(message).where(eq(message.id, aiMsgId)).limit(1);
        return newMsg;
      }
      return null;
    });

    if (saved) {
      return res.json({ success: true, ai_generated: true, message: saved });
    } else {
      return res.json({ success: true, ai_generated: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

chatRouter.post('/conversations/:id/request-human', verifyVisitorToken, async (req, res) => {
  try {
    const { id } = req.params;
    const visitorId = (req as any).visitorId;
    
    let [conv] = await db.select().from(conversation).where(eq(conversation.id, String(id))).limit(1);
    if (!conv || conv.userId !== visitorId) return res.status(404).json({ error: 'Conversation not found' });
    await db.update(conversation).set({
      mode: 'HUMAN',
      chatStatus: 'WAITING_FOR_ADMIN',
      needsHuman: true,
      updatedAt: new Date()
    }).where(eq(conversation.id, String(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

chatRouter.post('/conversations/:id/resolve', verifyVisitorToken, async (req, res) => {
  try {
    const { id } = req.params;
    const visitorId = (req as any).visitorId;

    let [conv] = await db.select().from(conversation).where(eq(conversation.id, String(id))).limit(1);
    if (!conv || conv.userId !== visitorId) return res.status(404).json({ error: 'Conversation not found' });
    await db.update(conversation).set({
      mode: 'CLOSED',
      chatStatus: 'RESOLVED',
      status: 'CLOSED',
      needsHuman: false,
    }).where(eq(conversation.id, String(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

chatRouter.get('/messages', verifyVisitorToken, async (req, res) => {
  try {
    const { conversationId } = req.query;
    const visitorId = (req as any).visitorId;
    if (!conversationId || typeof conversationId !== 'string') return res.status(400).json({ error: 'conversationId required' });

    const { asc } = await import('drizzle-orm');
    const [conv] = await db.select().from(conversation).where(eq(conversation.id, conversationId)).limit(1);
    if (!conv || conv.userId !== visitorId) return res.status(404).json({ error: 'Conversation not found' });

    const msgs = await db.select().from(message).where(eq(message.conversationId, conversationId)).orderBy(asc(message.createdAt));
    res.json({
      mode: conv.mode,
      chatStatus: conv.chatStatus,
      assignedAdminId: conv.assignedAdminId,
      status: conv.status,
      takenBy: conv.takenBy,
      messages: msgs
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

chatRouter.post('/conversations/:id/tawk-identity', verifyVisitorToken, async (req, res) => {
  try {
    const { id } = req.params;
    const visitorId = (req as any).visitorId;
    
    let [conv] = await db.select().from(conversation).where(eq(conversation.id, String(id))).limit(1);
    if (!conv || conv.userId !== visitorId) return res.status(404).json({ error: 'Conversation not found' });

    const settings = await getAiSettings();
    if (!settings.tawkEnabled) {
      return res.status(400).json({ enabled: false, error: 'Tawk.to integration disabled' });
    }

    const visitorInfo = req.body; // e.g. { name, email, phone }
    if (!visitorInfo.email && !visitorInfo.name) {
      return res.status(400).json({ error: 'Missing identity data' });
    }

    const payload: any = {
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
      const rows = await db.select().from(content).where(eq(content.key, 'ai_settings'));
      if (rows.length > 0) {
        const rawSettings = JSON.parse(rows[0].value);
        if (rawSettings.tawkSecret) {
          const actualSecret = decrypt(rawSettings.tawkSecret);
          if (actualSecret && visitorInfo.email) { // secure mode requires email
            payload.visitor.hash = crypto.createHmac('sha256', actualSecret).update(visitorInfo.email).digest('hex');
          }
        }
      }
    }

    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

chatRouter.post('/conversations/:id/handoff-status', verifyVisitorToken, async (req, res) => {
  try {
    const { id } = req.params;
    const visitorId = (req as any).visitorId;
    const { status, failureReason } = req.body;
    
    let [conv] = await db.select().from(conversation).where(eq(conversation.id, String(id))).limit(1);
    if (!conv || conv.userId !== visitorId) return res.status(404).json({ error: 'Conversation not found' });

    // Validate transition
    const validTransitions: Record<string, string[]> = {
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

    const updates: any = {
      chatStatus: status,
      updatedAt: new Date()
    };
    
    if (status === 'REQUESTED') updates.handoffRequestedAt = new Date();
    if (status === 'TAWK_OPENED') updates.tawkOpenedAt = new Date();
    if (status === 'AGENT_JOINED') updates.agentJoinedAt = new Date();
    if (status === 'COMPLETED') updates.handoffCompletedAt = new Date();
    if (status === 'FAILED') updates.handoffFailureReason = failureReason;

    await db.update(conversation).set(updates).where(eq(conversation.id, String(id)));
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
