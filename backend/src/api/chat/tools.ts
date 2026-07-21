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
  interestedJob?: string;
  cvFileName?: string;
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
 * Find existing candidate by email or phone
 */
export async function findCandidateByContact(email: string, phone?: string) {
  try {
    const conditions = [eq(candidate.email, email.toLowerCase().trim())];
    if (phone && phone.trim()) {
      conditions.push(eq(candidate.phone, phone.trim()));
    }

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
export async function createOrUpdateCandidate(data: CandidateData) {
  try {
    const cleanEmail = data.email.toLowerCase().trim();
    const existing = await findCandidateByContact(cleanEmail, data.phone);

    if (existing) {
      // Update candidate profile
      const updateData: any = { updatedAt: new Date() };
      if (data.name) updateData.name = data.name;
      if (data.phone) updateData.phone = data.phone;
      if (data.cvFileName) updateData.cvFileName = data.cvFileName;
      if (data.interestedJob) {
        const jobs = existing.interestedJobs ? existing.interestedJobs.split(', ') : [];
        if (!jobs.includes(data.interestedJob)) {
          jobs.push(data.interestedJob);
        }
        updateData.interestedJobs = jobs.join(', ');
      }

      await db.update(candidate).set(updateData).where(eq(candidate.id, existing.id));
      const [updated] = await db.select().from(candidate).where(eq(candidate.id, existing.id)).limit(1);
      return { candidate: updated, isNew: false };
    } else {
      // Insert new candidate
      const newId = crypto.randomUUID();
      await db.insert(candidate).values({
        id: newId,
        email: cleanEmail,
        name: data.name,
        phone: data.phone || null,
        interestedJobs: data.interestedJob || 'General Application (AI Chat)',
        cvFileName: data.cvFileName || null,
      });

      const [inserted] = await db.select().from(candidate).where(eq(candidate.id, newId)).limit(1);
      return { candidate: inserted, isNew: true };
    }
  } catch (error: any) {
    console.error("createOrUpdateCandidate error:", error);
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
