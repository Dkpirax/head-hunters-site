"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { randomUUID } from "crypto";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return success anyway to prevent email enumeration
      return { success: true };
    }

    // Generate token
    const token = randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    });

    if (resend) {
      const emailFrom = process.env.EMAIL_FROM || "Head Hunters <noreply@headhunters.com.au>";
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const resetLink = `${siteUrl}/reset-password?token=${token}`;

      await resend.emails.send({
        from: emailFrom,
        to: user.email,
        subject: "Head Hunters Admin Password Reset",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 800; color: #02695e; letter-spacing: -0.02em;">HEAD HUNTERS</span>
            </div>
            
            <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
              Hello ${user.name || "Administrator"},
            </p>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
              We received a request to reset your password. Click the button below to choose a new password. This link will expire in 1 hour.
            </p>
            
            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${resetLink}" style="background-color: #02695e; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                Reset Password
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; border-t: 1px solid #f3f4f6; pt: 16px; margin: 0;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>
        `
      });
    } else {
      console.warn("No RESEND_API_KEY provided. Password reset token generated:", token);
    }

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: "An error occurred. Please try again." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { success: false, error: "Invalid or expired token." };
    }

    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return { success: false, error: "Token has expired." };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.adminUser.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({ where: { token } });

    return { success: true };
  } catch (error) {
    console.error("Failed to reset password:", error);
    return { success: false, error: "An error occurred. Please try again." };
  }
}
