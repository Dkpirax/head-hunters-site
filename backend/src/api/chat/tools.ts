import { db } from '../../lib/db';
import { job, candidate, enquiry, conversation } from '../../db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

export interface JobSearchFilters {
  query?: string;
  location?: string;
  type?: string; // CASUAL, PERMANENT, REMOTE, EXECUTIVE
}

export interface CandidateData {
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  status?: string;
  source?: string;
  interestedJob?: string;
  cvFileName?: string;
  originalCvFileName?: string;
}

export interface EmployerData {
  name: string;
  companyName: string;
  email: string;
  phone?: string;
  designation?: string;
  vacancyTitle?: string;
  vacancyCount?: string;
  location?: string;
  description?: string;
}

export const APPROVED_WEBSITE_LINKS: Record<string, { label: string; url: string }> = {
  HOME: { label: "Home", url: "/" },
  JOBS: { label: "View All Vacancies", url: "/jobs" },
  UPLOAD_CV: { label: "Upload CV", url: "/upload-cv" },
  SERVICES: { label: "Recruitment Services", url: "/services" },
  EMPLOYERS: { label: "For Employers", url: "/#employers" },
  CANDIDATES: { label: "For Candidates", url: "/#candidates" },
  ABOUT: { label: "About Us", url: "/about" },
  CONTACT: { label: "Contact Us", url: "/contact" },
  PRIVACY: { label: "Privacy Policy", url: "/privacy" },
  TERMS: { label: "Terms of Service", url: "/terms" },
};

/**
 * Search active, published jobs
 */
export async function searchJobs(filters: JobSearchFilters = {}) {
  try {
    const conditions = [eq(job.status, 'ACTIVE')];

    if (filters.query) {
      conditions.push(
        or(
          like(job.title, `%${filters.query}%`),
          like(job.description, `%${filters.query}%`)
        )!
      );
    }

    if (filters.location) {
      conditions.push(like(job.location, `%${filters.location}%`));
    }

    if (filters.type) {
      conditions.push(eq(job.type, filters.type.toUpperCase()));
    }

    const results = await db
      .select({
        id: job.id,
        title: job.title,
        location: job.location,
        type: job.type,
        isHot: job.isHot,
        createdAt: job.createdAt,
      })
      .from(job)
      .where(and(...conditions))
      .orderBy(desc(job.createdAt))
      .limit(10);

    return results.map(j => ({
      ...j,
      url: `/jobs/${j.id}`
    }));
  } catch (error) {
    console.error("searchJobs error:", error);
    return [];
  }
}

/**
 * Get job details by ID
 */
export async function getJobDetails(jobId: string) {
  try {
    const [result] = await db
      .select()
      .from(job)
      .where(and(eq(job.id, jobId), eq(job.status, 'ACTIVE')))
      .limit(1);

    if (!result) return null;
    return {
      ...result,
      url: `/jobs/${result.id}`
    };
  } catch (error) {
    console.error("getJobDetails error:", error);
    return null;
  }
}

/**
 * Normalize phone numbers to standard format for reliable matching
 * e.g., "0771112222", "+94771112222", "+94 77 111 2222" -> "+94771112222"
 */
export function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return `+94${digits.slice(1)}`;
  }
  if (digits.startsWith('94') && digits.length === 11) {
    return `+${digits}`;
  }
  if (digits.length >= 7) {
    return `+${digits}`;
  }
  return phone.trim();
}

/**
 * Find existing candidate by email, phone, or whatsapp (including normalized fields)
 */
export async function findCandidateByContact(email: string, phone?: string, whatsapp?: string) {
  try {
    const conditions = [];
    if (email && email.trim()) {
      conditions.push(eq(candidate.email, email.toLowerCase().trim()));
    }

    const normPhone = normalizePhone(phone);
    if (phone && phone.trim()) {
      conditions.push(eq(candidate.phone, phone.trim()));
      if (normPhone) {
        conditions.push(eq(candidate.phone, normPhone));
        conditions.push(eq(candidate.phoneNormalized, normPhone));
      }
    }

    const normWa = normalizePhone(whatsapp);
    if (whatsapp && whatsapp.trim()) {
      conditions.push(eq(candidate.whatsapp, whatsapp.trim()));
      if (normWa) {
        conditions.push(eq(candidate.whatsapp, normWa));
        conditions.push(eq(candidate.whatsappNormalized, normWa));
      }
    }

    if (conditions.length === 0) return null;

    const [existing] = await db
      .select()
      .from(candidate)
      .where(or(...conditions))
      .limit(1);

    return existing || null;
  } catch (error) {
    console.error("findCandidateByContact error:", error);
    return null;
  }
}

/**
 * Create or update candidate record in database
 */
export async function createOrUpdateCandidate(data: CandidateData & { conversationId?: string }) {
  try {
    const cleanEmail = data.email ? data.email.toLowerCase().trim() : '';
    const existing = await findCandidateByContact(cleanEmail, data.phone, data.whatsapp);

    const normPhone = normalizePhone(data.phone) || data.phone || null;
    const normWa = normalizePhone(data.whatsapp) || data.whatsapp || null;

    let cRecord: any = null;
    let isNew = false;

    if (existing) {
      // Update existing candidate profile without overwriting with nulls
      const updateData: any = { updatedAt: new Date() };
      if (data.name) updateData.name = data.name;
      if (data.phone) updateData.phone = data.phone;
      if (normPhone) updateData.phoneNormalized = normPhone;
      if (data.whatsapp) updateData.whatsapp = data.whatsapp;
      if (normWa) updateData.whatsappNormalized = normWa;
      if (data.location) updateData.location = data.location;
      if (data.status) updateData.status = data.status;
      if (data.source) updateData.source = data.source;
      if (data.cvFileName) updateData.cvFileName = data.cvFileName;
      if (data.originalCvFileName) updateData.originalCvFileName = data.originalCvFileName;
      updateData.consentAccepted = true;
      updateData.consentTimestamp = new Date();
      if (data.conversationId) updateData.consentConversationId = data.conversationId;

      if (data.interestedJob) {
        const jobs = existing.interestedJobs ? existing.interestedJobs.split(', ') : [];
        if (!jobs.includes(data.interestedJob)) {
          jobs.push(data.interestedJob);
        }
        updateData.interestedJobs = jobs.join(', ');
      }

      await db.update(candidate).set(updateData).where(eq(candidate.id, existing.id));
      const [updated] = await db.select().from(candidate).where(eq(candidate.id, existing.id)).limit(1);
      cRecord = updated;
      isNew = false;
    } else {
      // Insert new candidate record
      const newId = crypto.randomUUID();
      await db.insert(candidate).values({
        id: newId,
        email: cleanEmail,
        name: data.name || 'Candidate',
        phone: data.phone || normPhone,
        phoneNormalized: normPhone,
        whatsapp: data.whatsapp || normWa,
        whatsappNormalized: normWa,
        location: data.location || null,
        status: data.status || 'ACTIVE',
        source: data.source || 'AI_CHAT',
        interestedJobs: data.interestedJob || 'General Application (AI Chat)',
        cvFileName: data.cvFileName || null,
        originalCvFileName: data.originalCvFileName || null,
        consentAccepted: true,
        consentTimestamp: new Date(),
        privacyPolicyVersion: '1.0',
        consentConversationId: data.conversationId || null,
      });

      const [inserted] = await db.select().from(candidate).where(eq(candidate.id, newId)).limit(1);
      cRecord = inserted;
      isNew = true;
    }

    // Insert CandidateConsent history record
    try {
      const { candidateConsent } = await import('../../db/schema');
      await db.insert(candidateConsent).values({
        id: crypto.randomUUID(),
        candidateId: cRecord.id,
        conversationId: data.conversationId || null,
        privacyPolicyVersion: '1.0',
        consentType: 'CANDIDATE_PROFILE_AND_CV',
        accepted: true,
        acceptedAt: new Date(),
        source: 'AI_CHAT',
      });
    } catch (consentErr) {
      console.warn("CandidateConsent logging warning:", consentErr);
    }

    return { candidate: cRecord, isNew };
  } catch (error: any) {
    console.error("createOrUpdateCandidate error:", error);
    throw error;
  }
}

/**
 * Create JobApplication record connecting Candidate to Job (Idempotent)
 */
export async function createJobApplication(candidateId: string, jobId: string, conversationId?: string) {
  try {
    const { jobApplication } = await import('../../db/schema');

    // Check if application already exists for candidateId + jobId
    const [existing] = await db
      .select()
      .from(jobApplication)
      .where(and(eq(jobApplication.candidateId, candidateId), eq(jobApplication.jobId, jobId)))
      .limit(1);

    if (existing) {
      return { ...existing, alreadyApplied: true };
    }

    const newId = crypto.randomUUID();
    await db.insert(jobApplication).values({
      id: newId,
      candidateId,
      jobId,
      applicationStatus: 'SUBMITTED',
      source: 'AI_CHAT',
      conversationId: conversationId || null,
    });
    const [app] = await db.select().from(jobApplication).where(eq(jobApplication.id, newId)).limit(1);
    return { ...app, alreadyApplied: false };
  } catch (error: any) {
    console.error("createJobApplication error:", error);
    throw error;
  }
}

/**
 * Create employer lead / vacancy requirement in database (Enquiry table)
 */
export async function createEmployerLead(data: EmployerData) {
  try {
    const newId = crypto.randomUUID();
    const messagePayload = [
      `Company: ${data.companyName}`,
      data.designation ? `Designation: ${data.designation}` : null,
      data.vacancyTitle ? `Position Needed: ${data.vacancyTitle}` : null,
      data.vacancyCount ? `Vacancies: ${data.vacancyCount}` : null,
      data.location ? `Location: ${data.location}` : null,
      data.description ? `Details: ${data.description}` : null,
    ].filter(Boolean).join(' | ');

    await db.insert(enquiry).values({
      id: newId,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone || null,
      type: 'HIRING',
      message: messagePayload,
      status: 'NEW',
    });

    const [created] = await db.select().from(enquiry).where(eq(enquiry.id, newId)).limit(1);
    return created;
  } catch (error: any) {
    console.error("createEmployerLead error:", error);
    throw error;
  }
}

/**
 * Get approved internal link URL
 */
export function getApprovedWebsiteLink(key: string) {
  return APPROVED_WEBSITE_LINKS[key.toUpperCase()] || APPROVED_WEBSITE_LINKS.JOBS;
}
