"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { headers } from "next/headers";
import { requirePermission } from "@/lib/permissions";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Simple in-memory IP rate limiter (10 per hour per IP)
const ipCache = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipCache.get(ip);
  
  if (!record) {
    ipCache.set(ip, { count: 1, resetTime: now + 3600000 }); // 1 hour window
    return true;
  }
  
  if (now > record.resetTime) {
    ipCache.set(ip, { count: 1, resetTime: now + 3600000 });
    return true;
  }
  
  if (record.count >= 10) {
    return false;
  }
  
  record.count += 1;
  return true;
}

export type EnquiryType = "HIRING" | "CANDIDATE" | "GENERAL";
export type EnquiryStatus = "NEW" | "READ" | "ASSIGNED" | "ARCHIVED";

export interface CreateEnquiryInput {
  name: string;
  email: string;
  phone?: string;
  type: EnquiryType;
  message: string;
}

export async function createEnquiry(data: CreateEnquiryInput) {
  // Rate limiting check
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "127.0.0.1";
  
  if (!checkRateLimit(ip)) {
    throw new Error("Too many enquiries from this IP. Please wait up to 1 hour before trying again.");
  }

  // Validate basic inputs
  if (!data.name || !data.email || !data.type || !data.message) {
    throw new Error("Missing required fields for enquiry.");
  }

  // Create the record in SQLite via Prisma
  const enquiry = await prisma.enquiry.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      type: data.type,
      message: data.message,
      status: "NEW",
    },
  });

  // Attempt to notify team via email using Resend
  if (resend) {
    try {
      const emailFrom = process.env.EMAIL_FROM || "Head Hunters <noreply@headhunters.com.au>";
      const emailTo = process.env.EMAIL_TO || "hello@headhunters.com.au";
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      await resend.emails.send({
        from: emailFrom,
        to: emailTo,
        subject: `New ${data.type} Enquiry: ${data.name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 800; color: #02695e; letter-spacing: -0.02em;">HEAD HUNTERS</span>
            </div>
            
            <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">New Enquiry Received</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
              A new <strong>${data.type.toLowerCase()}</strong> enquiry has been submitted on the Head Hunters portal. Here are the details:
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-weight: 500; width: 120px;">Name</td>
                <td style="padding: 10px 0; color: #111827; font-weight: 600;">${data.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-weight: 500;">Email</td>
                <td style="padding: 10px 0; color: #111827;"><a href="mailto:${data.email}" style="color: #04a891; text-decoration: none;">${data.email}</a></td>
              </tr>
              ${data.phone ? `
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-weight: 500;">Phone</td>
                <td style="padding: 10px 0; color: #111827;">${data.phone}</td>
              </tr>
              ` : ""}
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-weight: 500;">Branch</td>
                <td style="padding: 10px 0;">
                  <span style="background-color: #02695e; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                    ${data.type}
                  </span>
                </td>
              </tr>
            </table>
            
            <div style="margin-bottom: 28px; padding: 16px; background-color: #f9fafb; border-left: 4px solid #04a891; border-radius: 4px;">
              <p style="margin-top: 0; margin-bottom: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em;">Message</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${data.message}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${siteUrl}/admin/enquiries" style="background-color: #02695e; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                View Enquiry in Admin Dashboard
              </a>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error("Resend notification error:", error);
    }
  }

  // Revalidate pages to update content dynamically
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");

  return enquiry;
}

export async function getEnquiries() {
  await requirePermission("view_enquiries");

  return await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  await requirePermission("view_enquiries");

  const updated = await prisma.enquiry.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");

  return updated;
}

export async function deleteEnquiry(id: string) {
  await requirePermission("view_enquiries");

  const deleted = await prisma.enquiry.delete({
    where: { id },
  });

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");

  return deleted;
}
