const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME || 'katherine.schneider@ethereal.email',
    pass: process.env.SMTP_PASSWORD || 's9RfjykhAfudZXeXbR',
  },
});

const sendRentalConfirmation = async (user, rental, equipment) => {
  try {
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'Equipment Rental System' }" <${process.env.MAIL_FROM_ADDRESS || 'katherine.schneider@ethereal.email' }>`,
      to: user.email,
      subject: `Rental Confirmation - ${equipment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Rental Confirmation</h2>
          <p>Hello ${user.first_name},</p>
          <p>Your rental has been confirmed. Here are your rental details:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Rental Details</h3>
            <p><strong>Equipment:</strong> ${equipment.name}</p>
            <p><strong>Rental Period:</strong> ${new Date(rental.start_date).toLocaleDateString()} to ${new Date(rental.end_date).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> ${Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24))} days</p>
            <p><strong>Total Amount:</strong> $${rental.total_amount}</p>
            <p><strong>Status:</strong> ${rental.status}</p>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          <br>
          <p>Best regards,<br>Equipment Rental Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Rental confirmation email sent to:', user.email);
  } catch (error) {
    console.error('Error sending rental confirmation email:', error);
  }
};

const sendPaymentConfirmation = async (user, rental, payment) => {
  try {
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: user.email,
      subject: `Payment Confirmation - Rental #${rental.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Payment Confirmed</h2>
          <p>Hello ${user.first_name},</p>
          <p>Your payment has been successfully processed. Thank you for your business!</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Payment Details</h3>
            <p><strong>Rental ID:</strong> #${rental.id}</p>
            <p><strong>Equipment:</strong> ${rental.equipment_name}</p>
            <p><strong>Amount Paid:</strong> $${payment.amount}</p>
            <p><strong>Payment Date:</strong> ${new Date(payment.created_at).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${payment.payment_method}</p>
          </div>
          
          <p>We look forward to serving you!</p>
          <br>
          <p>Best regards,<br>Equipment Rental Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent to:', user.email);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
  }
};

module.exports = {
  sendRentalConfirmation,
  sendPaymentConfirmation,
};