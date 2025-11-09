import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  const email = process.env.EMAIL;
  const password = process.env.EMAIL_PASSWORD;

  if (!email || !password) {
    logger.warn(
      '[Email Service] Email credentials not configured. Email sending will be disabled.'
    );
    return null;
  }

  // Validate email format
  if (!email.includes('@')) {
    logger.error('[Email Service] Invalid email format in EMAIL environment variable');
    return null;
  }

  // Gmail App Passwords are 16 characters (can have spaces which should be removed)
  // Remove any spaces from the password (Gmail app passwords sometimes have spaces)
  const cleanedPassword = password.replace(/\s/g, '');
  
  if (cleanedPassword.length !== 16) {
    logger.warn(
      `[Email Service] App Password should be 16 characters (got ${cleanedPassword.length}). Gmail requires an App Password. See EMAIL_SETUP.md for instructions.`
    );
  }

  try {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email.trim(),
        pass: cleanedPassword, // Use cleaned password (spaces removed)
      },
      // Add timeout and connection options
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  } catch (error: any) {
    logger.error(`[Email Service] Failed to create email transporter: ${error.message}`);
    return null;
  }
};

export class EmailService {
  static async sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string
  ): Promise<void> {
    const transporter = createTransporter();

    if (!transporter) {
      logger.warn(
        `[Email Service] Email not sent to ${to}: Email service not configured`
      );
      return;
    }

    try {
      const emailFrom = process.env.EMAIL || 'noreply@crm.com';

      const mailOptions = {
        from: `CRM System <${emailFrom}>`,
        to,
        subject,
        text: body,
        html: html || body.replace(/\n/g, '<br>'),
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(
        `[Email Service] Email sent successfully to ${to}. Message ID: ${info.messageId}`
      );
    } catch (error: any) {
      // Don't throw error - email failures shouldn't crash the app
      // Just log the error for debugging
      logger.error(
        `[Email Service] Failed to send email to ${to}: ${error.message}`
      );
      
      // If it's an authentication error, provide helpful message
      if (error.message.includes('Invalid login') || error.message.includes('BadCredentials')) {
        logger.error(
          `[Email Service] Gmail authentication failed. Please ensure you're using an App Password, not your regular Gmail password. See: https://support.google.com/accounts/answer/185833`
        );
      }
    }
  }

  static async sendLeadAssignmentNotification(
    userEmail: string,
    leadTitle: string,
    leadId: number
  ): Promise<void> {
    const subject = `New Lead Assigned: ${leadTitle}`;
    const body = `Hello,\n\nA new lead has been assigned to you:\n- Title: ${leadTitle}\n- Lead ID: ${leadId}\n\nPlease review and take necessary action.\n\nBest regards,\nCRM System`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">New Lead Assigned</h2>
        <p>Hello,</p>
        <p>A new lead has been assigned to you:</p>
        <ul>
          <li><strong>Title:</strong> ${leadTitle}</li>
          <li><strong>Lead ID:</strong> ${leadId}</li>
        </ul>
        <p>Please review and take necessary action.</p>
        <p>Best regards,<br>CRM System</p>
      </div>
    `;

    await this.sendEmail(userEmail, subject, body, html);
  }

  static async sendLeadStatusChangeNotification(
    userEmail: string,
    leadTitle: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const subject = `Lead Status Updated: ${leadTitle}`;
    const body = `Hello,\n\nThe status of lead "${leadTitle}" has been updated:\n- Previous Status: ${oldStatus}\n- New Status: ${newStatus}\n\nBest regards,\nCRM System`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">Lead Status Updated</h2>
        <p>Hello,</p>
        <p>The status of lead <strong>"${leadTitle}"</strong> has been updated:</p>
        <ul>
          <li><strong>Previous Status:</strong> ${oldStatus}</li>
          <li><strong>New Status:</strong> ${newStatus}</li>
        </ul>
        <p>Best regards,<br>CRM System</p>
      </div>
    `;

    await this.sendEmail(userEmail, subject, body, html);
  }

  static async sendActivityNotification(
    userEmail: string,
    leadTitle: string,
    activityType: string,
    activityNote?: string
  ): Promise<void> {
    const subject = `New Activity on Lead: ${leadTitle}`;
    const body = `Hello,\n\nA new ${activityType} activity has been added to lead "${leadTitle}":\n${activityNote ? `- Note: ${activityNote}\n` : ''}\nBest regards,\nCRM System`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">New Activity Added</h2>
        <p>Hello,</p>
        <p>A new <strong>${activityType}</strong> activity has been added to lead <strong>"${leadTitle}"</strong>:</p>
        ${activityNote ? `<p><strong>Note:</strong> ${activityNote}</p>` : ''}
        <p>Best regards,<br>CRM System</p>
      </div>
    `;

    await this.sendEmail(userEmail, subject, body, html);
  }
}
