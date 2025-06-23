import nodemailer from "nodemailer";
import config from "../config/env.config";

// Create a transporter
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

// Email templates
export const emailTemplates = {
  resetPassword: (token: string) => ({
    subject: "Password Reset",
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${process.env.CLIENT_URL}/reset-password?token=${token}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  }),
  welcome: (firstName: string) => ({
    subject: "Welcome to Our Platform!",
    html: `
      <h1>Welcome, ${firstName}!</h1>
      <p>Thank you for registering with our service.</p>
      <p>We're excited to have you on board.</p>
    `,
  }),
};

// Send email function
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: config.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// Test email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
      return false;
    }

    // Verify connection configuration
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("Email configuration verification failed:", error);
    return false;
  }
};
