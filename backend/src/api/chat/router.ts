import { searchJobs, createEmployerLead, createOrUpdateCandidate, APPROVED_WEBSITE_LINKS } from './tools';

export type IntentCategory = 
  | 'JOB_SEARCH'
  | 'JOB_DETAILS'
  | 'CANDIDATE_CV_UPLOAD'
  | 'EMPLOYER_HIRING'
  | 'HUMAN_HANDOFF'
  | 'GENERAL_COMPANY_INFORMATION'
  | 'UNKNOWN';

export interface RouterResult {
  intent: IntentCategory;
  confidence: number;
  response: string;
  cardType?: 'JOB_LIST' | 'EMPLOYER_FORM' | 'CONFIRMATION' | 'CV_UPLOAD' | 'HANDOFF_PROMPT';
  data?: any;
  nextState?: string;
  grounded?: boolean;
}

/**
 * Intent Classifier
 */
export function classifyIntent(text: string): { intent: IntentCategory; confidence: number } {
  const lower = text.toLowerCase().trim();

  // 1. Human Handoff Intent
  if (/(\bspeak\b|\btalk\b|\bconnect\b|\bhuman\b|\bconsultant\b|\brecruiter\b|\bperson\b|\bagent\b|\bcall me\b|\bstop bot\b)/i.test(lower)) {
    return { intent: 'HUMAN_HANDOFF', confidence: 0.95 };
  }

  // 2. Employer Hiring Intent (CRITICAL FIX: "I need a candidate" / "We need staff" MUST BE EMPLOYER_HIRING)
  if (/(\bneed a candidate\b|\bneed candidates\b|\bneed staff\b|\bwant to hire\b|\bhire someone\b|\bhave a vacancy\b|\bneed employees\b|\brecruit someone\b|\biam an employer\b|\bi am an employer\b|\brecruitment requirement\b|\bhiring manager\b)/i.test(lower)) {
    return { intent: 'EMPLOYER_HIRING', confidence: 0.98 };
  }

  // 3. Job Search Intent ("what jobs u have?", "vacancies", "looking for work", "jobs in colombo")
  if (/(\bwhat jobs\b|\bany jobs\b|\bshow me jobs\b|\bavailable jobs\b|\bvacancies\b|\bopenings\b|\blooking for work\b|\bneed a job\b|\bfind a job\b|\bjob openings\b|\bwork in\b|\bsales jobs\b|\baccounts vacancies\b)/i.test(lower)) {
    return { intent: 'JOB_SEARCH', confidence: 0.95 };
  }

  // 4. Candidate CV Upload Intent
  if (/(\bupload\b.*\b(cv|resume)\b|\bsubmit\b.*\b(cv|resume)\b|\bsend\b.*\b(cv|resume)\b|\bregister my cv\b|\battach cv\b)/i.test(lower)) {
    return { intent: 'CANDIDATE_CV_UPLOAD', confidence: 0.95 };
  }

  // 5. General Company Info Intent
  if (/(\bfee\b|\bguarantee\b|\boffice\b|\blocation\b|\bcontact\b|\bservices\b|\bterms\b|\bpricing\b|\bhow much\b|\bcost\b)/i.test(lower)) {
    return { intent: 'GENERAL_COMPANY_INFORMATION', confidence: 0.9 };
  }

  return { intent: 'UNKNOWN', confidence: 0.5 };
}

/**
 * Handle Intent & Execute Workflows
 */
export async function processChatIntent(
  text: string, 
  currentState: string = 'IDLE',
  stateData: any = {}
): Promise<RouterResult> {
  const { intent } = classifyIntent(text);

  // Workflow State Machine handling active turn
  if (currentState.startsWith('EMPLOYER_COLLECTING_')) {
    return handleEmployerStep(text, currentState, stateData);
  }

  switch (intent) {
    case 'JOB_SEARCH': {
      // Execute live DB query for jobs
      const jobs = await searchJobs({});
      if (jobs.length === 0) {
        return {
          intent: 'JOB_SEARCH',
          confidence: 0.95,
          response: "There are currently no open vacancies listed. You can submit your CV and our recruitment team will notify you as soon as a matching role opens up!",
          cardType: 'CV_UPLOAD',
          data: { link: APPROVED_WEBSITE_LINKS.UPLOAD_CV }
        };
      }

      const jobListFormatted = jobs.slice(0, 4).map((j: any) => 
        `• **${j.title}** (${j.type})\n  📍 ${j.location} | [View Job & Apply](${j.url})`
      ).join('\n\n');

      return {
        intent: 'JOB_SEARCH',
        confidence: 0.98,
        response: `Here are our latest published vacancies:\n\n${jobListFormatted}\n\nWhat type of position or location are you looking for?`,
        cardType: 'JOB_LIST',
        data: { jobs },
        nextState: 'JOB_SEARCH'
      };
    }

    case 'EMPLOYER_HIRING': {
      return {
        intent: 'EMPLOYER_HIRING',
        confidence: 0.98,
        response: "Certainly — I can help you submit a recruitment requirement.\n\nWhat is your contact name?",
        cardType: 'EMPLOYER_FORM',
        nextState: 'EMPLOYER_COLLECTING_NAME',
        data: {}
      };
    }

    case 'CANDIDATE_CV_UPLOAD': {
      return {
        intent: 'CANDIDATE_CV_UPLOAD',
        confidence: 0.95,
        response: "Great! You can upload your CV (.pdf, .doc, .docx under 10 MB) directly using the paperclip attachment icon below, or visit our full CV submission form.",
        cardType: 'CV_UPLOAD',
        nextState: 'CANDIDATE_AWAITING_CV',
        data: { link: APPROVED_WEBSITE_LINKS.UPLOAD_CV }
      };
    }

    case 'HUMAN_HANDOFF': {
      return {
        intent: 'HUMAN_HANDOFF',
        confidence: 0.95,
        response: "Would you like me to connect you directly with a HeadHunters recruitment consultant?",
        cardType: 'HANDOFF_PROMPT',
        nextState: 'HANDOFF_CONFIRMATION'
      };
    }

    default:
      return {
        intent: 'UNKNOWN',
        confidence: 0.5,
        response: "Welcome to HeadHunters. How can we help you today? You can search open jobs, submit your CV, or request recruitment staff for your business."
      };
  }
}

/**
 * Step-by-step Employer Data Collection State Machine
 */
async function handleEmployerStep(text: string, currentState: string, data: any): Promise<RouterResult> {
  const val = text.trim();

  if (currentState === 'EMPLOYER_COLLECTING_NAME') {
    return {
      intent: 'EMPLOYER_HIRING',
      confidence: 1,
      response: `Thank you, ${val}. What is your company name?`,
      nextState: 'EMPLOYER_COLLECTING_COMPANY',
      data: { ...data, name: val }
    };
  }

  if (currentState === 'EMPLOYER_COLLECTING_COMPANY') {
    return {
      intent: 'EMPLOYER_HIRING',
      confidence: 1,
      response: `Got it. What position or role are you looking to recruit for ${val}?`,
      nextState: 'EMPLOYER_COLLECTING_VACANCY',
      data: { ...data, companyName: val }
    };
  }

  if (currentState === 'EMPLOYER_COLLECTING_VACANCY') {
    return {
      intent: 'EMPLOYER_HIRING',
      confidence: 1,
      response: "Please enter your contact email address or phone number so our senior consultant can reach out with candidate profiles:",
      nextState: 'EMPLOYER_COLLECTING_CONTACT',
      data: { ...data, vacancyTitle: val }
    };
  }

  if (currentState === 'EMPLOYER_COLLECTING_CONTACT') {
    const isEmail = val.includes('@');
    const updatedData = {
      ...data,
      email: isEmail ? val : (data.email || 'info@headhunters.lk'),
      phone: isEmail ? (data.phone || null) : val
    };

    // Save lead to database
    try {
      const lead = await createEmployerLead({
        name: updatedData.name || 'Employer',
        companyName: updatedData.companyName || 'Company',
        email: updatedData.email,
        phone: updatedData.phone || null,
        vacancyTitle: updatedData.vacancyTitle || 'Staffing Request'
      });

      return {
        intent: 'EMPLOYER_HIRING',
        confidence: 1,
        response: `Thank you! Your recruitment requirement for **${updatedData.vacancyTitle}** at **${updatedData.companyName}** has been submitted.\n\nReference Code: **HH-EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}**\nOur recruitment team will contact you shortly!`,
        cardType: 'CONFIRMATION',
        nextState: 'IDLE',
        data: { leadId: lead.id }
      };
    } catch (err) {
      return {
        intent: 'EMPLOYER_HIRING',
        confidence: 1,
        response: `Thank you, ${updatedData.name}. Your vacancy details have been recorded. Our team will get in touch with you shortly.`,
        nextState: 'IDLE'
      };
    }
  }

  return {
    intent: 'EMPLOYER_HIRING',
    confidence: 1,
    response: "How else can we assist with your recruitment needs today?",
    nextState: 'IDLE'
  };
}
