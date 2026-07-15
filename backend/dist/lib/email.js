"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEnquiryNotification = sendEnquiryNotification;
exports.sendEnquiryConfirmation = sendEnquiryConfirmation;
exports.sendEnquiryReply = sendEnquiryReply;
const resend_1 = require("resend");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../.env' });
const resend = process.env.RESEND_API_KEY ? new resend_1.Resend(process.env.RESEND_API_KEY) : null;
const emailFrom = process.env.EMAIL_FROM_ADDRESS || 'Head Hunters <hello@headhunters.com.au>';
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_TO || 'hello@headhunters.com.au';
const siteUrl = process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
async function sendEnquiryNotification(data) {
    if (!resend) {
        console.warn('RESEND_API_KEY not configured. Skipping email notification.');
        return;
    }
    try {
        await resend.emails.send({
            from: emailFrom,
            to: adminEmail,
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
              <td style="padding: 10px 0; color: #6b7280; font-weight: 500;">Type</td>
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
    }
    catch (error) {
        console.error("Resend notification error:", error);
    }
}
async function sendEnquiryConfirmation(data) {
    if (!resend)
        return;
    try {
        await resend.emails.send({
            from: emailFrom,
            to: data.email,
            subject: `We've received your enquiry - Head Hunters`,
            html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Hi ${data.name},</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
            Thanks for reaching out to Head Hunters. We have received your ${data.type.toLowerCase()} enquiry.
            Our team will review your message and get back to you shortly.
          </p>
        </div>
      `
        });
    }
    catch (error) {
        console.error("Resend confirmation error:", error);
    }
}
async function sendEnquiryReply(data) {
    if (!resend) {
        console.warn('RESEND_API_KEY not configured. Cannot send reply.');
        return { success: false, reason: 'RESEND_API_KEY environment variable is not configured' };
    }
    try {
        const result = await resend.emails.send({
            from: emailFrom,
            to: data.email,
            replyTo: adminEmail,
            subject: `Re: Your Head Hunters Enquiry`,
            html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 800; color: #02695e; letter-spacing: -0.02em;">HEAD HUNTERS</span>
          </div>
          <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Hi ${data.name},</h2>
          <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-left: 4px solid #04a891; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${data.replyText}</p>
          </div>
          <p style="color: #6b7280; font-size: 13px;">Best regards,<br/><strong>${data.adminName}</strong><br/>Head Hunters Recruitment</p>
        </div>
      `
        });
        return { success: true, id: result.data?.id };
    }
    catch (error) {
        console.error("Resend reply error:", error);
        return { success: false, reason: error?.message || 'Unknown email error' };
    }
}
