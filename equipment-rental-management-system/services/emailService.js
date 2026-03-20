const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME || 'katherine.schneider@ethereal.email',
        pass: process.env.SMTP_PASSWORD || 's9RfjykhAfudZXeXbR'
      }
    });
  }

  async sendEmail(to, subject, html, text = '') {
    try {
      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'Equipment Rental Systems'}" <${process.env.SMTP_USERNAME || 'katherine.schneider@ethereal.email' }>`,
        to,
        subject,
        html,
        text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendRegistrationConfirmation(email, firstName, verificationToken) {
    const subject = 'Welcome to Equipment Rental System - Please Verify Your Email';
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Equipment Rental System, ${firstName}!</h2>
        <p>Thank you for registering with us. To complete your registration, please verify your email address by clicking the button below:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>

        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>

        <p>This link will expire in 24 hours for security reasons.</p>

        <p>If you didn't create an account, please ignore this email.</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Equipment Rental System<br>
          Questions? Contact our support team.
        </p>
      </div>
    `;

    const text = `
      Welcome to Equipment Rental System, ${firstName}!

      Thank you for registering with us. To complete your registration, please verify your email address by visiting: ${verificationUrl}

      This link will expire in 24 hours for security reasons.

      If you didn't create an account, please ignore this email.

      Equipment Rental System
    `;

    return await this.sendEmail(email, subject, html, text);
  }

  async sendPasswordReset(email, firstName, resetToken) {
    const subject = 'Password Reset Request - Equipment Rental System';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Hello ${firstName},</p>
        <p>You have requested to reset your password. Click the button below to create a new password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p>If the button doesn't work, copy and paste this link: ${resetUrl}</p>

        <p>This link will expire in 1 hour for security reasons.</p>

        <p>If you didn't request a password reset, please ignore this email.</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Equipment Rental System</p>
      </div>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendRentalConfirmation(email, firstName, rentalDetails) {
    const subject = 'Rental Confirmation - Equipment Rental System';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Rental Confirmed!</h2>
        <p>Hello ${firstName},</p>
        <p>Your equipment rental has been confirmed. Here are the details:</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Rental Details</h3>
          <p><strong>Equipment:</strong> ${rentalDetails.equipment_name}</p>
          <p><strong>Rental Period:</strong> ${new Date(rentalDetails.start_date).toLocaleDateString()} - ${new Date(rentalDetails.end_date).toLocaleDateString()}</p>
          <p><strong>Quantity:</strong> ${rentalDetails.quantity}</p>
          <p><strong>Total Amount:</strong> $${rentalDetails.total_amount}</p>
          <p><strong>Rental ID:</strong> #${rentalDetails.id}</p>
        </div>

        <p>You will receive pickup instructions when your rental period begins.</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Equipment Rental System</p>
      </div>
    `;

    return await this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();
