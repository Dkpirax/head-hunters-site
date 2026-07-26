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
exports.APPROVED_WEBSITE_LINKS = void 0;
exports.searchJobs = searchJobs;
exports.getJobDetails = getJobDetails;
exports.normalizePhone = normalizePhone;
exports.findCandidateByContact = findCandidateByContact;
exports.createOrUpdateCandidate = createOrUpdateCandidate;
exports.createJobApplication = createJobApplication;
exports.createEmployerLead = createEmployerLead;
exports.getApprovedWebsiteLink = getApprovedWebsiteLink;
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
exports.APPROVED_WEBSITE_LINKS = {
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
async function searchJobs(filters = {}) {
    try {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.job.status, 'ACTIVE')];
        if (filters.query) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.job.title, `%${filters.query}%`), (0, drizzle_orm_1.like)(schema_1.job.description, `%${filters.query}%`)));
        }
        if (filters.location) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.job.location, `%${filters.location}%`));
        }
        if (filters.type) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.job.type, filters.type.toUpperCase()));
        }
        const results = await db_1.db
            .select({
            id: schema_1.job.id,
            title: schema_1.job.title,
            location: schema_1.job.location,
            type: schema_1.job.type,
            isHot: schema_1.job.isHot,
            createdAt: schema_1.job.createdAt,
        })
            .from(schema_1.job)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.job.createdAt))
            .limit(10);
        return results.map(j => ({
            ...j,
            url: `/jobs/${j.id}`
        }));
    }
    catch (error) {
        console.error("searchJobs error:", error);
        return [];
    }
}
/**
 * Get job details by ID
 */
async function getJobDetails(jobId) {
    try {
        const [result] = await db_1.db
            .select()
            .from(schema_1.job)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.job.id, jobId), (0, drizzle_orm_1.eq)(schema_1.job.status, 'ACTIVE')))
            .limit(1);
        if (!result)
            return null;
        return {
            ...result,
            url: `/jobs/${result.id}`
        };
    }
    catch (error) {
        console.error("getJobDetails error:", error);
        return null;
    }
}
/**
 * Normalize phone numbers to standard format for reliable matching
 * e.g., "0771112222", "+94771112222", "+94 77 111 2222" -> "+94771112222"
 */
function normalizePhone(phone) {
    if (!phone)
        return undefined;
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
async function findCandidateByContact(email, phone, whatsapp) {
    try {
        const conditions = [];
        if (email && email.trim()) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.candidate.email, email.toLowerCase().trim()));
        }
        const normPhone = normalizePhone(phone);
        if (phone && phone.trim()) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.candidate.phone, phone.trim()));
            if (normPhone) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.candidate.phone, normPhone));
                conditions.push((0, drizzle_orm_1.eq)(schema_1.candidate.phoneNormalized, normPhone));
            }
        }
        const normWa = normalizePhone(whatsapp);
        if (whatsapp && whatsapp.trim()) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.candidate.whatsapp, whatsapp.trim()));
            if (normWa) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.candidate.whatsapp, normWa));
                conditions.push((0, drizzle_orm_1.eq)(schema_1.candidate.whatsappNormalized, normWa));
            }
        }
        if (conditions.length === 0)
            return null;
        const [existing] = await db_1.db
            .select()
            .from(schema_1.candidate)
            .where((0, drizzle_orm_1.or)(...conditions))
            .limit(1);
        return existing || null;
    }
    catch (error) {
        console.error("findCandidateByContact error:", error);
        return null;
    }
}
/**
 * Create or update candidate record in database
 */
async function createOrUpdateCandidate(data) {
    try {
        const cleanEmail = data.email ? data.email.toLowerCase().trim() : '';
        const existing = await findCandidateByContact(cleanEmail, data.phone, data.whatsapp);
        const normPhone = normalizePhone(data.phone) || data.phone || null;
        const normWa = normalizePhone(data.whatsapp) || data.whatsapp || null;
        let cRecord = null;
        let isNew = false;
        if (existing) {
            // Update existing candidate profile without overwriting with nulls
            const updateData = { updatedAt: new Date() };
            if (data.name)
                updateData.name = data.name;
            if (data.phone)
                updateData.phone = data.phone;
            if (normPhone)
                updateData.phoneNormalized = normPhone;
            if (data.whatsapp)
                updateData.whatsapp = data.whatsapp;
            if (normWa)
                updateData.whatsappNormalized = normWa;
            if (data.location)
                updateData.location = data.location;
            if (data.status)
                updateData.status = data.status;
            if (data.source)
                updateData.source = data.source;
            if (data.cvFileName)
                updateData.cvFileName = data.cvFileName;
            if (data.originalCvFileName)
                updateData.originalCvFileName = data.originalCvFileName;
            updateData.consentAccepted = true;
            updateData.consentTimestamp = new Date();
            if (data.conversationId)
                updateData.consentConversationId = data.conversationId;
            if (data.interestedJob) {
                const jobs = existing.interestedJobs ? existing.interestedJobs.split(', ') : [];
                if (!jobs.includes(data.interestedJob)) {
                    jobs.push(data.interestedJob);
                }
                updateData.interestedJobs = jobs.join(', ');
            }
            await db_1.db.update(schema_1.candidate).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.candidate.id, existing.id));
            const [updated] = await db_1.db.select().from(schema_1.candidate).where((0, drizzle_orm_1.eq)(schema_1.candidate.id, existing.id)).limit(1);
            cRecord = updated;
            isNew = false;
        }
        else {
            // Insert new candidate record
            const newId = crypto_1.default.randomUUID();
            await db_1.db.insert(schema_1.candidate).values({
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
            const [inserted] = await db_1.db.select().from(schema_1.candidate).where((0, drizzle_orm_1.eq)(schema_1.candidate.id, newId)).limit(1);
            cRecord = inserted;
            isNew = true;
        }
        // Insert CandidateConsent history record
        try {
            const { candidateConsent } = await Promise.resolve().then(() => __importStar(require('../../db/schema')));
            await db_1.db.insert(candidateConsent).values({
                id: crypto_1.default.randomUUID(),
                candidateId: cRecord.id,
                conversationId: data.conversationId || null,
                privacyPolicyVersion: '1.0',
                consentType: 'CANDIDATE_PROFILE_AND_CV',
                accepted: true,
                acceptedAt: new Date(),
                source: 'AI_CHAT',
            });
        }
        catch (consentErr) {
            console.warn("CandidateConsent logging warning:", consentErr);
        }
        return { candidate: cRecord, isNew };
    }
    catch (error) {
        console.error("createOrUpdateCandidate error:", error);
        throw error;
    }
}
/**
 * Create JobApplication record connecting Candidate to Job (Idempotent)
 */
async function createJobApplication(candidateId, jobId, conversationId) {
    try {
        const { jobApplication } = await Promise.resolve().then(() => __importStar(require('../../db/schema')));
        // Check if application already exists for candidateId + jobId
        const [existing] = await db_1.db
            .select()
            .from(jobApplication)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(jobApplication.candidateId, candidateId), (0, drizzle_orm_1.eq)(jobApplication.jobId, jobId)))
            .limit(1);
        if (existing) {
            return { ...existing, alreadyApplied: true };
        }
        const newId = crypto_1.default.randomUUID();
        await db_1.db.insert(jobApplication).values({
            id: newId,
            candidateId,
            jobId,
            applicationStatus: 'SUBMITTED',
            source: 'AI_CHAT',
            conversationId: conversationId || null,
        });
        const [app] = await db_1.db.select().from(jobApplication).where((0, drizzle_orm_1.eq)(jobApplication.id, newId)).limit(1);
        return { ...app, alreadyApplied: false };
    }
    catch (error) {
        console.error("createJobApplication error:", error);
        throw error;
    }
}
/**
 * Create employer lead / vacancy requirement in database (Enquiry table)
 */
async function createEmployerLead(data) {
    try {
        const newId = crypto_1.default.randomUUID();
        const messagePayload = [
            `Company: ${data.companyName}`,
            data.designation ? `Designation: ${data.designation}` : null,
            data.vacancyTitle ? `Position Needed: ${data.vacancyTitle}` : null,
            data.vacancyCount ? `Vacancies: ${data.vacancyCount}` : null,
            data.location ? `Location: ${data.location}` : null,
            data.description ? `Details: ${data.description}` : null,
        ].filter(Boolean).join(' | ');
        await db_1.db.insert(schema_1.enquiry).values({
            id: newId,
            name: data.name,
            email: data.email.toLowerCase().trim(),
            phone: data.phone || null,
            type: 'HIRING',
            message: messagePayload,
            status: 'NEW',
        });
        const [created] = await db_1.db.select().from(schema_1.enquiry).where((0, drizzle_orm_1.eq)(schema_1.enquiry.id, newId)).limit(1);
        return created;
    }
    catch (error) {
        console.error("createEmployerLead error:", error);
        throw error;
    }
}
/**
 * Get approved internal link URL
 */
function getApprovedWebsiteLink(key) {
    return exports.APPROVED_WEBSITE_LINKS[key.toUpperCase()] || exports.APPROVED_WEBSITE_LINKS.JOBS;
}
