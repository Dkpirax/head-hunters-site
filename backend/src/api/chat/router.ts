import { searchJobs, createEmployerLead, createOrUpdateCandidate, APPROVED_WEBSITE_LINKS } from './tools';

// ─── Intent Categories ────────────────────────────────────────────────────────
export type IntentCategory =
  | 'GREETING'
  | 'THANKS'
  | 'GOODBYE'
  | 'ASSISTANT_IDENTITY'
  | 'ASSISTANT_CAPABILITIES'
  | 'JOB_SEARCH'
  | 'JOB_DETAILS'
  | 'JOB_APPLICATION'
  | 'CANDIDATE_REGISTER'
  | 'CANDIDATE_CV_UPLOAD'
  | 'EMPLOYER_HIRING'
  | 'EMPLOYER_VACANCY_SUBMISSION'
  | 'AMBIGUOUS_RECRUITMENT'
  | 'WEBSITE_NAVIGATION'
  | 'GENERAL_COMPANY_INFORMATION'
  | 'HUMAN_HANDOFF'
  | 'WORKFLOW_CANCEL'
  | 'OFF_TOPIC'
  | 'UNKNOWN';

export type WorkflowType = 'NONE' | 'CANDIDATE' | 'EMPLOYER' | 'JOB_APPLICATION' | 'HUMAN_HANDOFF';
export type WorkflowState =
  | 'IDLE'
  | 'EMPLOYER_COLLECTING_NAME'
  | 'EMPLOYER_COLLECTING_COMPANY'
  | 'EMPLOYER_COLLECTING_POSITION'
  | 'EMPLOYER_COLLECTING_VACANCIES'
  | 'EMPLOYER_COLLECTING_LOCATION'
  | 'EMPLOYER_COLLECTING_CONTACT'
  | 'EMPLOYER_CONFIRMATION'
  | 'EMPLOYER_SUBMITTED'
  | 'CANDIDATE_COLLECTING_NAME'
  | 'CANDIDATE_COLLECTING_EMAIL'
  | 'CANDIDATE_COLLECTING_PHONE'
  | 'CANDIDATE_COLLECTING_WHATSAPP'
  | 'CANDIDATE_COLLECTING_LOCATION'
  | 'CANDIDATE_COLLECTING_PREFERENCES'
  | 'CANDIDATE_AWAITING_CV'
  | 'CANDIDATE_CONFIRMATION'
  | 'CANDIDATE_SUBMITTED'
  | 'HANDOFF_CONFIRMATION'
  | 'HUMAN_HANDOFF';

export interface WorkflowContext {
  workflowType: WorkflowType;
  workflowState: WorkflowState;
  workflowData: Record<string, any>;
  conversationId?: string;
}

export interface RouterResult {
  intent: IntentCategory;
  confidence: number;
  response: string;
  cardType?: 'JOB_LIST' | 'EMPLOYER_FORM' | 'CONFIRMATION' | 'CV_UPLOAD' | 'HANDOFF_PROMPT' | 'QUICK_REPLIES';
  data?: any;
  nextWorkflowType?: WorkflowType;
  nextWorkflowState?: WorkflowState;
  nextWorkflowData?: Record<string, any>;
  callsRAG?: boolean;   // Explicit flag — only true for GENERAL_COMPANY_INFORMATION
  grounded?: boolean;
}

// ─── Dev Logging ─────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';

function logRouter(label: string, data: any) {
  if (isDev) {
    console.log(`[CHAT ROUTER] ${label}:`, JSON.stringify(data, null, 2));
  }
}

// ─── Validation Helpers ───────────────────────────────────────────────────────
function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function isValidPhone(val: string): boolean {
  // Sri Lankan (+94) and general international formats
  return /^(\+?94|0)?[0-9\s\-]{7,15}$/.test(val.trim());
}

function sanitiseText(val: string, maxLen = 200): string {
  return val.trim().slice(0, maxLen).replace(/[<>]/g, '');
}

function isPositiveInt(val: string): boolean {
  return /^\d+$/.test(val.trim()) && parseInt(val) > 0 && parseInt(val) <= 9999;
}

// ─── Workflow Expiry ──────────────────────────────────────────────────────────
const WORKFLOW_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes of inactivity

export function isWorkflowExpired(workflowUpdatedAt: Date | null): boolean {
  if (!workflowUpdatedAt) return false;
  return Date.now() - new Date(workflowUpdatedAt).getTime() > WORKFLOW_EXPIRY_MS;
}

// ─── Intent Classifier ───────────────────────────────────────────────────────
export function classifyIntent(text: string): { intent: IntentCategory; confidence: number } {
  const lower = text.toLowerCase().trim();

  // 1. Workflow cancel / reset
  if (/^(cancel|stop|reset|start over|go back|quit|exit|i want something else|never mind|nevermind|abort)\b/.test(lower)) {
    return { intent: 'WORKFLOW_CANCEL', confidence: 0.97 };
  }

  // 2. Greeting
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|hiya|greetings|sup|yo)\b/.test(lower)) {
    return { intent: 'GREETING', confidence: 0.99 };
  }

  // 3. Thanks / Acknowledgement
  if (/^(thank(s| you)|ok(ay)?|got it|sure|great|perfect|alright|cool|noted|understood|cheers|appreciate)\b/.test(lower)) {
    return { intent: 'THANKS', confidence: 0.97 };
  }

  // 4. Goodbye
  if (/^(bye|goodbye|see you|see ya|later|take care|farewell)\b/.test(lower)) {
    return { intent: 'GOODBYE', confidence: 0.97 };
  }

  // 5. Assistant identity
  if (/(are\s+you\s+(a\s+)?(bot|ai|human|robot|machine|real|person|automated)|who\s+are\s+you|r\s+u\s+ai|are\s+u\s+(ai|a\s+bot))/i.test(lower)) {
    return { intent: 'ASSISTANT_IDENTITY', confidence: 0.99 };
  }

  // 6. Assistant capabilities
  if (/(what\s+can\s+you\s+do|how\s+(can\s+you\s+help|do\s+you\s+work)|help\s*me?$|what\s+is\s+this\s+(chat|for)|what\s+are\s+you\s*(able|capable|for|$)|your\s+capabilities)/i.test(lower)) {
    return { intent: 'ASSISTANT_CAPABILITIES', confidence: 0.97 };
  }

  // 7. Human handoff (explicit request for a person)
  if (/(speak\s+to|talk\s+to|connect\s+(me\s+)?to|need\s+a\s+human|need\s+a\s+person|real\s+(agent|person|consultant|recruiter)|human\s+agent|live\s+(support|agent|chat)|stop\s+the\s+bot|call\s+me)\b/i.test(lower)) {
    return { intent: 'HUMAN_HANDOFF', confidence: 0.96 };
  }

  // 8. Employer hiring (MUST precede job-search to prevent misclassification)
  //    "I need a candidate" ALWAYS = employer, never a job-seeker
  if (/(need\s+(a\s+|some\s+|[0-9]+\s+)?candidate|need\s+(a\s+|some\s+|[0-9]+\s+)?staff|need\s+(a\s+)?employee|want\s+to\s+hire|hire\s+someone|have\s+a\s+vacancy|looking\s+to\s+hire|need\s+to\s+hire|i\s+am\s+an\s+employer|i'm\s+an\s+employer|we\s+are\s+hiring|we're\s+hiring|find\s+me\s+a|find\s+me\s+[0-9]+|we\s+need\s+[a-z]+\s*(staff|people|workers|employees)|recruitment\s+requirement|hiring\s+manager|recruiting\s+for)/i.test(lower)) {
    return { intent: 'EMPLOYER_HIRING', confidence: 0.98 };
  }

  // 9. CV upload explicit / location / questions
  if (
    /(where|how|can|could|want|need|should).*(upload|send|attach|submit|put).*(cv|resume|curriculum)/i.test(lower) ||
    /(cv|resume|curriculum).*(upload|send|attach|submit|page|link|where|how)/i.test(lower) ||
    /(upload|send|attach|submit|share|register|update).*(cv|resume|curriculum)/i.test(lower) ||
    /^(where|how)\s+(upload|send|attach|submit)\s+(the\s+)?(cv|resume)$/i.test(lower) ||
    /^(upload|send)\s+(the\s+)?(cv|resume)$/i.test(lower) ||
    /(here('s| is| my))\s*(my\s*)?(cv|resume)/i.test(lower)
  ) {
    return { intent: 'CANDIDATE_CV_UPLOAD', confidence: 0.98 };
  }

  // 10. Candidate register
  if (/(register\s+(as\s+a?\s+)?candidate|add\s+me\s+as|sign\s+me\s+up|want\s+to\s+register|i\s+am\s+looking\s+for\s+(a\s+)?job|looking\s+for\s+(work|employment|a\s+position)|seeking\s+(employment|work|a\s+job))/i.test(lower)) {
    return { intent: 'CANDIDATE_REGISTER', confidence: 0.93 };
  }

  // 11. Job search (broad patterns)
  if (/(what\s+jobs?|any\s+jobs?|show\s+(me\s+)?jobs?|available\s+jobs?|job\s+(openings?|listings?|vacancies)|vacancies|openings|looking\s+for\s+work|need\s+a\s+job|find\s+a\s+job|i\s+need\s+work|i\s+want\s+a\s+job|jobs?\s+in\s+[a-z]+|[a-z]+\s+jobs?|[a-z]+\s+vacancies?|browse\s+jobs?|view\s+jobs?|current\s+(positions?|roles?|openings?))/i.test(lower)) {
    return { intent: 'JOB_SEARCH', confidence: 0.94 };
  }

  // 12. Ambiguous (pronoun references without context or general requests)
  if (
    /(where\s+should\s+i\s+send\s+it|how\s+to\s+send\s+it|can\s+i\s+send\s+it)/i.test(lower) ||
    (/i\s+need\s+(a\s+|an\s+)?[a-z]+/i.test(lower) && lower.split(' ').length <= 6)
  ) {
    return { intent: 'AMBIGUOUS_RECRUITMENT', confidence: 0.85 };
  }

  // 13. Website navigation
  if (/(where\s+(can\s+i|do\s+i|is)|(take\s+me\s+to|go\s+to|navigate\s+to|open)\s+the?)\s+[a-z]/i.test(lower) ||
      /\b(homepage|contact\s+page|jobs?\s+page|about\s+page|upload\s+cv\s+page)\b/i.test(lower)) {
    return { intent: 'WEBSITE_NAVIGATION', confidence: 0.88 };
  }

  // 14. Company-specific knowledge (ONLY these should call RAG)
  if (/(fee|charge|cost|pricing|how\s+much|guarantee|replacement|terms\s+of|our\s+process|office|address|location\s+of|contact\s+(us|details)|email\s+(address)?|phone\s+(number)?|whatsapp|industries?\s+(you\s+)?(serve|cover)|services?\s+(you\s+)?offer|privacy\s+policy|refund|payment\s+policy|candidate\s+(process|fee)|employer\s+process|recruitment\s+process)/i.test(lower)) {
    return { intent: 'GENERAL_COMPANY_INFORMATION', confidence: 0.90 };
  }

  return { intent: 'UNKNOWN', confidence: 0.4 };
}

// ─── Quick-reply button helper ────────────────────────────────────────────────
function quickReplies(text: string, buttons: string[]): RouterResult {
  return {
    intent: 'UNKNOWN',
    confidence: 0.9,
    response: text,
    cardType: 'QUICK_REPLIES',
    data: { buttons },
    nextWorkflowType: 'NONE',
    nextWorkflowState: 'IDLE',
  };
}

// ─── Main Router ─────────────────────────────────────────────────────────────
export async function processChatIntent(
  text: string,
  workflow: WorkflowContext,
): Promise<RouterResult> {

  const { intent, confidence } = classifyIntent(text);

  logRouter('incoming', { text, workflow, intent, confidence });

  // ── Priority 0: Cancel / reset ─────────────────────────────────────────────
  if (intent === 'WORKFLOW_CANCEL' && workflow.workflowType !== 'NONE') {
    return {
      intent: 'WORKFLOW_CANCEL',
      confidence: 0.97,
      response: "No problem — I've cleared that. How else can I help you?\n\nYou can search for jobs, upload a CV, or submit a hiring requirement.",
      cardType: 'QUICK_REPLIES',
      data: { buttons: ['🔍 Find a Job', '📄 Upload my CV', '🤝 Hire Candidates'] },
      nextWorkflowType: 'NONE',
      nextWorkflowState: 'IDLE',
      nextWorkflowData: {},
    };
  }

  // ── Priority 1: Continue active employer workflow ───────────────────────────
  if (workflow.workflowType === 'EMPLOYER' && workflow.workflowState !== 'IDLE' && workflow.workflowState !== 'EMPLOYER_SUBMITTED') {
    return handleEmployerStep(text, workflow);
  }

  // ── Priority 2: Continue active candidate workflow ─────────────────────────
  if (workflow.workflowType === 'CANDIDATE' && workflow.workflowState !== 'IDLE' && workflow.workflowState !== 'CANDIDATE_SUBMITTED') {
    return handleCandidateStep(text, workflow);
  }

  // ── Priority 3: Deterministic conversational responses (no RAG) ───────────
  if (intent === 'GREETING') {
    logRouter('handler', 'GREETING - no RAG');
    return {
      intent: 'GREETING',
      confidence,
      response: "Hello! 👋 How can I help you today?",
      cardType: 'QUICK_REPLIES',
      data: { buttons: ['🔍 Find a Job', '📄 Upload my CV', '🤝 Hire Candidates', '❓ About HeadHunters'] },
      nextWorkflowType: 'NONE',
      nextWorkflowState: 'IDLE',
    };
  }

  if (intent === 'THANKS') {
    logRouter('handler', 'THANKS - no RAG');
    return {
      intent: 'THANKS',
      confidence,
      response: "You're welcome! Is there anything else I can help you with?",
      cardType: 'QUICK_REPLIES',
      data: { buttons: ['🔍 Find a Job', '🤝 Hire Candidates', '💬 Speak to a Consultant'] },
      nextWorkflowType: 'NONE',
      nextWorkflowState: 'IDLE',
    };
  }

  if (intent === 'GOODBYE') {
    logRouter('handler', 'GOODBYE - no RAG');
    return {
      intent: 'GOODBYE',
      confidence,
      response: "Goodbye! Feel free to come back any time. Good luck! 👋",
      nextWorkflowType: 'NONE',
      nextWorkflowState: 'IDLE',
    };
  }

  if (intent === 'ASSISTANT_IDENTITY') {
    logRouter('handler', 'ASSISTANT_IDENTITY - no RAG');
    return {
      intent: 'ASSISTANT_IDENTITY',
      confidence,
      response: "Yes — I'm the HeadHunters.lk AI recruitment assistant. 🤖\n\nI can help you search for jobs, upload your CV, submit a hiring requirement, or connect you with a recruitment consultant.",
      cardType: 'QUICK_REPLIES',
      data: { buttons: ['🔍 Find a Job', '🤝 Hire Candidates', '📄 Upload my CV'] },
      nextWorkflowType: 'NONE',
      nextWorkflowState: 'IDLE',
    };
  }

  if (intent === 'ASSISTANT_CAPABILITIES') {
    logRouter('handler', 'ASSISTANT_CAPABILITIES - no RAG');
    return {
      intent: 'ASSISTANT_CAPABILITIES',
      confidence,
      response: "Here's how I can help:\n\n• 🔍 **Search active vacancies** from our live database\n• 📄 **Upload your CV** and register as a candidate\n• 🤝 **Submit a hiring requirement** for your company\n• 💬 **Connect you with a recruitment consultant**\n• ❓ **Answer questions** about HeadHunters.lk services\n\nWhat would you like to do?",
      cardType: 'QUICK_REPLIES',
      data: { buttons: ['🔍 Find a Job', '📄 Upload my CV', '🤝 Hire Candidates', '💬 Speak to Consultant'] },
      nextWorkflowType: 'NONE',
      nextWorkflowState: 'IDLE',
    };
  }

  // ── Priority 4: Human handoff ──────────────────────────────────────────────
  if (intent === 'HUMAN_HANDOFF') {
    logRouter('handler', 'HUMAN_HANDOFF - no RAG');
    return {
      intent: 'HUMAN_HANDOFF',
      confidence,
      response: "Would you like me to connect you with a HeadHunters recruitment consultant?",
      cardType: 'HANDOFF_PROMPT',
      nextWorkflowType: 'HUMAN_HANDOFF',
      nextWorkflowState: 'HANDOFF_CONFIRMATION',
    };
  }

  // ── Priority 5: Employer hiring ────────────────────────────────────────────
  if (intent === 'EMPLOYER_HIRING') {
    logRouter('handler', 'EMPLOYER_HIRING - start workflow, no RAG');
    return {
      intent: 'EMPLOYER_HIRING',
      confidence,
      response: "Certainly — I can help you submit a recruitment requirement.\n\nWhat is your **full name**?",
      nextWorkflowType: 'EMPLOYER',
      nextWorkflowState: 'EMPLOYER_COLLECTING_NAME',
      nextWorkflowData: {},
    };
  }

  // ── Priority 6: Candidate CV upload ───────────────────────────────────────
  if (intent === 'CANDIDATE_CV_UPLOAD') {
    logRouter('handler', 'CANDIDATE_CV_UPLOAD - instructions & start workflow, no RAG');
    return {
      intent: 'CANDIDATE_CV_UPLOAD',
      confidence,
      response: "You can upload your CV directly here by tapping the paperclip attachment icon 📎 below.\n\nYou can also visit our dedicated CV upload page:\n\n👉 **[Upload Your CV](/upload-cv)**\n\nWould you like to register your candidate profile here now? What is your **full name**?",
      cardType: 'CV_UPLOAD',
      data: { link: APPROVED_WEBSITE_LINKS.UPLOAD_CV, buttons: ['📄 Upload CV Here', '🌐 Open Upload Page', '❌ I Don\'t Have a CV'] },
      nextWorkflowType: 'CANDIDATE',
      nextWorkflowState: 'CANDIDATE_COLLECTING_NAME',
      nextWorkflowData: {},
    };
  }

  // ── Priority 7: Candidate register ────────────────────────────────────────
  if (intent === 'CANDIDATE_REGISTER') {
    logRouter('handler', 'CANDIDATE_REGISTER - no RAG');
    return {
      intent: 'CANDIDATE_REGISTER',
      confidence,
      response: "I can help you register as a candidate.\n\nWhat is your **full name**?",
      nextWorkflowType: 'CANDIDATE',
      nextWorkflowState: 'CANDIDATE_COLLECTING_NAME',
      nextWorkflowData: {},
    };
  }

  // ── Priority 8: Job search ─────────────────────────────────────────────────
  if (intent === 'JOB_SEARCH') {
    logRouter('handler', 'JOB_SEARCH - calling live jobs API, no RAG');
    const lower = text.toLowerCase();

    // Extract optional query keywords from the message
    const queryMatch = lower.match(/(?:jobs?|vacancies?|roles?|positions?)\s+(?:in\s+|for\s+|as\s+)?([a-z\s]+)/i);
    const locationMatch = lower.match(/\bin\s+([a-z\s]+?)(?:\s*$|\s+and\b|\s+or\b)/i);
    const query = queryMatch ? queryMatch[1].trim() : undefined;
    const location = locationMatch ? locationMatch[1].trim() : undefined;

    const jobs = await searchJobs({ query, location });

    logRouter('jobSearchResult', { count: jobs.length, query, location });

    if (jobs.length === 0) {
      return {
        intent: 'JOB_SEARCH',
        confidence,
        response: "There are currently no published vacancies matching that search.\n\nYou can still upload your CV and our recruitment team will notify you as soon as a matching role opens up!",
        cardType: 'QUICK_REPLIES',
        data: { buttons: ['📄 Upload Your CV', '🌐 View All Jobs', '🎯 Tell Us Preferred Role'], link: APPROVED_WEBSITE_LINKS.UPLOAD_CV },
        nextWorkflowType: 'NONE',
        nextWorkflowState: 'IDLE',
      };
    }

    const jobList = jobs.slice(0, 5).map((j: any) =>
      `• **[${j.title}](/jobs/${j.id})** — ${j.type}\n  📍 ${j.location}`
    ).join('\n\n');

    return {
      intent: 'JOB_SEARCH',
      confidence,
      response: `Here are our current active vacancies:\n\n${jobList}\n\n[View all jobs →](/jobs)\n\nWhat type of position or location are you looking for?`,
      cardType: 'JOB_LIST',
      data: { jobs },
      nextWorkflowType: 'NONE',
      nextWorkflowState: 'IDLE',
    };
  }

  // ── Priority 9: Ambiguous (e.g. "I need a plumber") ──────────────────────
  if (intent === 'AMBIGUOUS_RECRUITMENT') {
    const lower = text.toLowerCase();
    if (/(send\s+it|upload\s+it)/i.test(lower)) {
      return {
        intent: 'AMBIGUOUS_RECRUITMENT',
        confidence,
        response: "What would you like to send — a **CV**, a **vacancy requirement**, or something else?",
        cardType: 'QUICK_REPLIES',
        data: { buttons: ['📄 Upload my CV', '🤝 Submit Vacancy Requirement', '💬 Speak to Consultant'] },
        nextWorkflowType: 'NONE',
        nextWorkflowState: 'IDLE',
      };
    }

    const roleMatch = text.match(/i\s+need\s+(a\s+|an\s+)?([a-z]+)/i);
    const role = roleMatch ? roleMatch[2] : 'person';
    logRouter('handler', `AMBIGUOUS_RECRUITMENT - role: ${role}, no RAG`);
    return {
      intent: 'AMBIGUOUS_RECRUITMENT',
      confidence,
      response: `Are you looking to **hire a ${role}**, or are you a **${role} looking for a job**?`,
      cardType: 'QUICK_REPLIES',
      data: { buttons: [`Hire a ${role}`, `Find a ${role} job`] },
      nextWorkflowType: 'NONE',
      nextWorkflowState: 'IDLE',
    };
  }

  // ── Priority 10: Company knowledge → RAG ──────────────────────────────────
  if (intent === 'GENERAL_COMPANY_INFORMATION') {
    logRouter('handler', 'GENERAL_COMPANY_INFORMATION - will call RAG');
    return {
      intent: 'GENERAL_COMPANY_INFORMATION',
      confidence,
      response: '',   // Let chat.ts fill in the RAG answer
      callsRAG: true,
    };
  }

  // ── Priority 11: UNKNOWN — helpful clarification, NEVER RAG ──────────────
  logRouter('handler', 'UNKNOWN - returning clarification, no RAG');
  return {
    intent: 'UNKNOWN',
    confidence,
    response: "I'm not sure what you need — I'm happy to help with any of these:",
    cardType: 'QUICK_REPLIES',
    data: { buttons: ['🔍 Find a Job', '📄 Upload my CV', '🤝 Hire Candidates', '💬 Speak to Consultant'] },
    nextWorkflowType: 'NONE',
    nextWorkflowState: 'IDLE',
  };
}

// ─── Employer Workflow ────────────────────────────────────────────────────────
async function handleEmployerStep(text: string, workflow: WorkflowContext): Promise<RouterResult> {
  const val = sanitiseText(text);
  const { workflowState } = workflow;
  const data: any = workflow.workflowData;

  logRouter('employerStep', { workflowState, val });

  // Allow cancellation mid-flow
  const { intent: checkIntent } = classifyIntent(text);
  if (checkIntent === 'WORKFLOW_CANCEL') {
    return {
      intent: 'WORKFLOW_CANCEL', confidence: 0.97,
      response: "No problem — I've cancelled the hiring request. How else can I help?",
      cardType: 'QUICK_REPLIES',
      data: { buttons: ['🔍 Find a Job', '🤝 Start Again', '💬 Speak to Consultant'] },
      nextWorkflowType: 'NONE', nextWorkflowState: 'IDLE', nextWorkflowData: {},
    };
  }

  switch (workflowState) {
    case 'EMPLOYER_COLLECTING_NAME': {
      if (!val || val.length < 2) {
        return { intent: 'EMPLOYER_HIRING', confidence: 1, response: "Please enter your full name.", nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_COLLECTING_NAME', nextWorkflowData: data };
      }
      return {
        intent: 'EMPLOYER_HIRING', confidence: 1,
        response: `Thank you, **${val}**. What is the name of your **company**?`,
        nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_COLLECTING_COMPANY',
        nextWorkflowData: { ...data, contactName: val },
      };
    }

    case 'EMPLOYER_COLLECTING_COMPANY': {
      if (!val || val.length < 2) {
        return { intent: 'EMPLOYER_HIRING', confidence: 1, response: "Please enter your company name.", nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_COLLECTING_COMPANY', nextWorkflowData: data };
      }
      return {
        intent: 'EMPLOYER_HIRING', confidence: 1,
        response: `Got it. What **position** are you looking to fill at **${val}**?`,
        nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_COLLECTING_POSITION',
        nextWorkflowData: { ...data, companyName: val },
      };
    }

    case 'EMPLOYER_COLLECTING_POSITION': {
      if (!val || val.length < 2) {
        return { intent: 'EMPLOYER_HIRING', confidence: 1, response: "Please describe the position you're hiring for.", nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_COLLECTING_POSITION', nextWorkflowData: data };
      }
      return {
        intent: 'EMPLOYER_HIRING', confidence: 1,
        response: `How many **${val}** do you need to hire? (Enter a number)`,
        nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_COLLECTING_VACANCIES',
        nextWorkflowData: { ...data, position: val },
      };
    }

    case 'EMPLOYER_COLLECTING_VACANCIES': {
      const count = val.replace(/[^0-9]/g, '');
      if (!isPositiveInt(count)) {
        return { intent: 'EMPLOYER_HIRING', confidence: 1, response: "Please enter the number of vacancies as a number (e.g. 1, 5).", nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_COLLECTING_VACANCIES', nextWorkflowData: data };
      }
      return {
        intent: 'EMPLOYER_HIRING', confidence: 1,
        response: `What **location** will this role be based in?`,
        nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_COLLECTING_LOCATION',
        nextWorkflowData: { ...data, vacancyCount: count },
      };
    }

    case 'EMPLOYER_COLLECTING_LOCATION': {
      if (!val || val.length < 2) {
        return { intent: 'EMPLOYER_HIRING', confidence: 1, response: "Please enter the work location (city, province, or 'All Island').", nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_COLLECTING_LOCATION', nextWorkflowData: data };
      }
      return {
        intent: 'EMPLOYER_HIRING', confidence: 1,
        response: `Please enter your **contact email or phone number** so our consultant can reach you:`,
        nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_COLLECTING_CONTACT',
        nextWorkflowData: { ...data, location: val },
      };
    }

    case 'EMPLOYER_COLLECTING_CONTACT': {
      const isEmail = isValidEmail(val);
      const isPhone = isValidPhone(val);

      if (!isEmail && !isPhone) {
        return {
          intent: 'EMPLOYER_HIRING', confidence: 1,
          response: "Please enter a valid email address (e.g. name@company.com) or phone number.",
          nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_COLLECTING_CONTACT', nextWorkflowData: data,
        };
      }

      const updatedData = {
        ...data,
        email: isEmail ? val : (data.email || null),
        phone: !isEmail ? val : (data.phone || null),
      };

      // Show confirmation summary before saving
      const summary = [
        `**Name:** ${updatedData.contactName || '—'}`,
        `**Company:** ${updatedData.companyName || '—'}`,
        `**Position:** ${updatedData.position || '—'}`,
        `**Vacancies:** ${updatedData.vacancyCount || '—'}`,
        `**Location:** ${updatedData.location || '—'}`,
        `**Contact:** ${isEmail ? updatedData.email : updatedData.phone}`,
      ].join('\n');

      return {
        intent: 'EMPLOYER_HIRING', confidence: 1,
        response: `Here's your hiring requirement:\n\n${summary}\n\nShall I **submit** this to our recruitment team? (Reply "yes" to confirm or "cancel" to discard)`,
        cardType: 'CONFIRMATION',
        nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_CONFIRMATION',
        nextWorkflowData: updatedData,
      };
    }

    case 'EMPLOYER_CONFIRMATION': {
      const lower = text.toLowerCase().trim();

      // Idempotency check: If already submitted in this workflow session, return existing summary
      if (data.leadId && data.refNumber) {
        return {
          intent: 'EMPLOYER_HIRING', confidence: 1,
          response: `✅ **Requirement already submitted.**\n\nReference: **${data.refNumber}**\n\nOur recruitment team is reviewing your requirement. What else can I help you with?`,
          cardType: 'CONFIRMATION',
          nextWorkflowType: 'NONE', nextWorkflowState: 'IDLE',
          nextWorkflowData: {},
        };
      }

      if (/^(yes|confirm|submit|send|ok|okay|go ahead|proceed|sure|correct|right)/.test(lower)) {
        // Save to database
        try {
          const lead = await createEmployerLead({
            name: data.contactName || 'Employer',
            companyName: data.companyName || 'Company',
            email: data.email || 'info@headhunters.lk',
            phone: data.phone || null,
            vacancyTitle: data.position || 'Staffing Request',
            vacancyCount: data.vacancyCount,
            location: data.location,
          });

          const refNumber = `HH-EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

          logRouter('employerLeadCreated', { leadId: lead.id, refNumber });

          return {
            intent: 'EMPLOYER_HIRING', confidence: 1,
            response: `✅ **Requirement submitted successfully!**\n\nReference: **${refNumber}**\n\nOur recruitment team will review your requirement and contact you shortly.\n\nAlternatively, you can complete a detailed form here: [Open Employer Form](/contact)`,
            cardType: 'CONFIRMATION',
            nextWorkflowType: 'NONE', nextWorkflowState: 'IDLE',
            nextWorkflowData: {},
          };
        } catch (err) {
          logRouter('employerLeadError', err);
          return {
            intent: 'EMPLOYER_HIRING', confidence: 1,
            response: `I encountered a problem saving your requirement. Please try again or [contact us directly](/contact).`,
            nextWorkflowType: 'EMPLOYER', nextWorkflowState: 'EMPLOYER_CONFIRMATION',
            nextWorkflowData: data,
          };
        }
      } else {
        return {
          intent: 'EMPLOYER_HIRING', confidence: 1,
          response: "No problem — your requirement has been discarded. How can I help you?",
          cardType: 'QUICK_REPLIES',
          data: { buttons: ['🔍 Find Jobs', '🤝 Start Hiring Request Again'] },
          nextWorkflowType: 'NONE', nextWorkflowState: 'IDLE', nextWorkflowData: {},
        };
      }
    }

    default:
      return {
        intent: 'EMPLOYER_HIRING', confidence: 1,
        response: "How else can I assist with your recruitment needs today?",
        nextWorkflowType: 'NONE', nextWorkflowState: 'IDLE',
      };
  }
}

// ─── Candidate Workflow ───────────────────────────────────────────────────────
async function handleCandidateStep(text: string, workflow: WorkflowContext): Promise<RouterResult> {
  const val = sanitiseText(text);
  const { workflowState } = workflow;
  const data: any = workflow.workflowData || {};

  logRouter('candidateStep', { workflowState, val });

  const { intent: checkIntent } = classifyIntent(text);
  if (checkIntent === 'WORKFLOW_CANCEL') {
    return {
      intent: 'WORKFLOW_CANCEL', confidence: 0.97,
      response: "No problem — I've cancelled candidate registration. How else can I help?",
      cardType: 'QUICK_REPLIES',
      data: { buttons: ['🔍 Find a Job', '🤝 Hire Candidates', '💬 Speak to Consultant'] },
      nextWorkflowType: 'NONE', nextWorkflowState: 'IDLE', nextWorkflowData: {},
    };
  }

  // Handle "no CV" trigger at any state
  if (/(don't|do not|no)\s+have\s+(a\s+)?(cv|resume)/i.test(val) || /no\s+cv/i.test(val)) {
    const updatedData = { ...data, hasNoCv: true };
    if (!data.name) {
      return {
        intent: 'CANDIDATE_REGISTER', confidence: 1,
        response: "No problem! We can still create an incomplete profile so recruiters can reach you when roles open up.\n\nWhat is your **full name**?",
        nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_NAME',
        nextWorkflowData: updatedData,
      };
    }
  }

  switch (workflowState) {
    case 'CANDIDATE_COLLECTING_NAME': {
      if (!val || val.length < 2) {
        return { intent: 'CANDIDATE_REGISTER', confidence: 1, response: "Please enter your full name.", nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_NAME', nextWorkflowData: data };
      }
      return {
        intent: 'CANDIDATE_REGISTER', confidence: 1,
        response: `Thanks, **${val}**! What is your **email address**?`,
        nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_EMAIL',
        nextWorkflowData: { ...data, name: val },
      };
    }

    case 'CANDIDATE_COLLECTING_EMAIL': {
      if (!isValidEmail(val)) {
        return { intent: 'CANDIDATE_REGISTER', confidence: 1, response: "Please enter a valid email address (e.g. name@example.com).", nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_EMAIL', nextWorkflowData: data };
      }
      return {
        intent: 'CANDIDATE_REGISTER', confidence: 1,
        response: "Got it! What is your **phone number**?",
        nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_PHONE',
        nextWorkflowData: { ...data, email: val },
      };
    }

    case 'CANDIDATE_COLLECTING_PHONE': {
      if (!isValidPhone(val)) {
        return { intent: 'CANDIDATE_REGISTER', confidence: 1, response: "Please enter a valid phone number (e.g. +94 77 123 4567).", nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_PHONE', nextWorkflowData: data };
      }
      return {
        intent: 'CANDIDATE_REGISTER', confidence: 1,
        response: "What is your **WhatsApp number**? (or type 'same' if same as phone)",
        nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_WHATSAPP',
        nextWorkflowData: { ...data, phone: val },
      };
    }

    case 'CANDIDATE_COLLECTING_WHATSAPP': {
      const waNumber = (val.toLowerCase() === 'same' || val.toLowerCase() === 'same number') ? data.phone : val;
      if (val.toLowerCase() !== 'same' && val.toLowerCase() !== 'same number' && !isValidPhone(waNumber)) {
        return { intent: 'CANDIDATE_REGISTER', confidence: 1, response: "Please enter a valid WhatsApp number or type 'same'.", nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_WHATSAPP', nextWorkflowData: data };
      }
      return {
        intent: 'CANDIDATE_REGISTER', confidence: 1,
        response: "What is your **location or city**?",
        nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_LOCATION',
        nextWorkflowData: { ...data, whatsapp: waNumber },
      };
    }

    case 'CANDIDATE_COLLECTING_LOCATION': {
      if (!val || val.length < 2) {
        return { intent: 'CANDIDATE_REGISTER', confidence: 1, response: "Please enter your location or city.", nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_LOCATION', nextWorkflowData: data };
      }
      return {
        intent: 'CANDIDATE_REGISTER', confidence: 1,
        response: "What is your **preferred job role or industry**?",
        nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_PREFERENCES',
        nextWorkflowData: { ...data, location: val },
      };
    }

    case 'CANDIDATE_COLLECTING_PREFERENCES': {
      if (!val || val.length < 2) {
        return { intent: 'CANDIDATE_REGISTER', confidence: 1, response: "Please specify your preferred role or industry.", nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_COLLECTING_PREFERENCES', nextWorkflowData: data };
      }
      const updatedData = { ...data, interestedJob: val };

      if (data.hasNoCv) {
        // Skip CV upload for visitors with no CV
        return generateCandidateConfirmation(updatedData);
      }

      return {
        intent: 'CANDIDATE_REGISTER', confidence: 1,
        response: "Please upload your CV using the 📎 paperclip icon below (PDF, DOC, DOCX under 10 MB), or reply 'no cv' to skip for now.",
        cardType: 'CV_UPLOAD',
        nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_AWAITING_CV',
        nextWorkflowData: updatedData,
      };
    }

    case 'CANDIDATE_AWAITING_CV': {
      if (/(don't|do not|no)\s+have\s+(a\s+)?(cv|resume)/i.test(val) || /no\s+cv/i.test(val) || val.toLowerCase() === 'skip') {
        return generateCandidateConfirmation({ ...data, hasNoCv: true });
      }
      // If CV was uploaded (via file upload route or attachment message)
      if (data.cvFileName || val.includes('Uploaded CV:')) {
        return generateCandidateConfirmation({ ...data, hasNoCv: false });
      }
      return {
        intent: 'CANDIDATE_REGISTER', confidence: 1,
        response: "Please attach your CV using the 📎 paperclip icon below, or reply 'no cv' to skip.",
        cardType: 'CV_UPLOAD',
        nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_AWAITING_CV',
        nextWorkflowData: data,
      };
    }

    case 'CANDIDATE_CONFIRMATION': {
      const lower = text.toLowerCase().trim();

      // Idempotency protection
      if (data.candidateId) {
        return {
          intent: 'CANDIDATE_REGISTER', confidence: 1,
          response: `✅ **Candidate profile already submitted.**\n\nWhat else can I help you with today?`,
          cardType: 'CONFIRMATION',
          nextWorkflowType: 'NONE', nextWorkflowState: 'IDLE',
          nextWorkflowData: {},
        };
      }

      if (/^(yes|confirm|submit|send|ok|okay|go ahead|proceed|sure|correct|right)/.test(lower)) {
        try {
          const { candidate: cRecord, isNew } = await createOrUpdateCandidate({
            name: data.name,
            email: data.email,
            phone: data.phone,
            whatsapp: data.whatsapp,
            location: data.location,
            status: data.hasNoCv ? 'INCOMPLETE' : 'ACTIVE',
            source: 'AI_CHAT',
            interestedJob: data.interestedJob || 'General Application (AI Chat)',
            cvFileName: data.cvFileName || null,
            originalCvFileName: data.originalCvFileName || null,
            conversationId: workflow.conversationId,
          });

          // Save consent timestamp to Candidate record
          const { db } = await import('../../lib/db');
          const { candidate: candTable } = await import('../../db/schema');
          const { eq } = await import('drizzle-orm');
          await db.update(candTable).set({
            consentAccepted: true,
            consentTimestamp: new Date(),
            privacyPolicyVersion: '1.0',
          }).where(eq(candTable.id, cRecord.id));

          // Create formal JobApplication if specific job was selected
          if (data.selectedJobId) {
            const { createJobApplication } = await import('./tools');
            await createJobApplication(cRecord.id, data.selectedJobId);
          }

          logRouter('candidateSubmitted', { candidateId: cRecord.id, isNew });

          const statusMsg = data.hasNoCv
            ? "⚠️ Profile saved as **Incomplete** (pending CV). You can upload your CV anytime at [Upload CV](/upload-cv)."
            : "✅ **Profile registered successfully!** Our recruitment consultants will match your CV against open positions.";

          return {
            intent: 'CANDIDATE_REGISTER', confidence: 1,
            response: `Thank you, **${cRecord.name}**!\n\n${statusMsg}`,
            cardType: 'CONFIRMATION',
            nextWorkflowType: 'NONE', nextWorkflowState: 'IDLE',
            nextWorkflowData: {},
          };
        } catch (err) {
          logRouter('candidateSubmitError', err);
          return {
            intent: 'CANDIDATE_REGISTER', confidence: 1,
            response: "I encountered a problem saving your candidate profile. Please try again or [submit your CV on our website](/upload-cv).",
            nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_CONFIRMATION',
            nextWorkflowData: data,
          };
        }
      } else {
        return {
          intent: 'CANDIDATE_REGISTER', confidence: 1,
          response: "Registration cancelled. How else can I help you today?",
          cardType: 'QUICK_REPLIES',
          data: { buttons: ['🔍 Find Jobs', '📄 Start Registration Again'] },
          nextWorkflowType: 'NONE', nextWorkflowState: 'IDLE', nextWorkflowData: {},
        };
      }
    }

    default:
      return {
        intent: 'CANDIDATE_REGISTER', confidence: 1,
        response: "How else can I help you?",
        nextWorkflowType: 'NONE', nextWorkflowState: 'IDLE',
      };
  }
}

function generateCandidateConfirmation(data: any): RouterResult {
  const summary = [
    `**Name:** ${data.name || '—'}`,
    `**Email:** ${data.email || '—'}`,
    `**Phone:** ${data.phone || '—'}`,
    `**WhatsApp:** ${data.whatsapp || '—'}`,
    `**Location:** ${data.location || '—'}`,
    `**Preferred Role:** ${data.interestedJob || '—'}`,
    `**CV File:** ${data.originalCvFileName || data.cvFileName || (data.hasNoCv ? 'Pending (No CV uploaded)' : 'Uploaded')}`,
  ].join('\n');

  const consentNotice = `\n\n🔒 *By confirming "yes", you agree that HeadHunters.lk may store your details and CV securely to match you with employment opportunities.*`;

  return {
    intent: 'CANDIDATE_REGISTER', confidence: 1,
    response: `Here is your candidate profile summary:\n\n${summary}${consentNotice}\n\nShall I **submit** your profile? (Reply "yes" to confirm or "cancel" to discard)`,
    cardType: 'CONFIRMATION',
    nextWorkflowType: 'CANDIDATE', nextWorkflowState: 'CANDIDATE_CONFIRMATION',
    nextWorkflowData: data,
  };
}
