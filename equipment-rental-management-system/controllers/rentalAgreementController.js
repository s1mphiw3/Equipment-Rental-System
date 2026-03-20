const RentalAgreement = require('../models/RentalAgreement');
const Rental = require('../models/Rental');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateAgreement = async (req, res) => {
  try {
    const { rentalId } = req.params;

    // Check if rental exists and user has permission
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if agreement already exists
    const existingAgreement = await RentalAgreement.findByRentalId(rentalId);
    if (existingAgreement) {
      return res.status(400).json({ error: 'Agreement already exists for this rental' });
    }

    // Generate agreement text
    const agreementText = RentalAgreement.generateAgreementText({
      equipment_name: rental.equipment_name,
      start_date: rental.start_date,
      end_date: rental.end_date,
      total_amount: rental.total_amount,
      customer_name: `${rental.first_name} ${rental.last_name}`,
      customer_email: rental.email,
      daily_rate: rental.total_amount / Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24))
    });

    // Generate PDF
    const pdfPath = await generateAgreementPDF(rental, agreementText);

    // Save agreement to database
    const agreementId = await RentalAgreement.create({
      rental_id: rentalId,
      agreement_text: agreementText,
      pdf_path: pdfPath
    });

    // Update rental to mark agreement as generated
    await require('../config/database').execute(
      'UPDATE rentals SET agreement_generated = TRUE WHERE id = ?',
      [rentalId]
    );

    const agreement = await RentalAgreement.findByRentalId(rentalId);

    res.status(201).json({
      success: true,
      message: 'Rental agreement generated successfully',
      data: agreement
    });
  } catch (error) {
    console.error('Generate agreement error:', error);
    res.status(500).json({ error: 'Failed to generate rental agreement' });
  }
};

const getAgreement = async (req, res) => {
  try {
    const { rentalId } = req.params;

    const agreement = await RentalAgreement.findByRentalId(rentalId);
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    // Check permissions
    const rental = await Rental.findById(rentalId);
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: agreement
    });
  } catch (error) {
    console.error('Get agreement error:', error);
    res.status(500).json({ error: 'Failed to fetch agreement' });
  }
};

const downloadAgreement = async (req, res) => {
  try {
    const { rentalId } = req.params;

    const agreement = await RentalAgreement.findByRentalId(rentalId);
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    // Check permissions
    const rental = await Rental.findById(rentalId);
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!agreement.pdf_path || !fs.existsSync(path.join(__dirname, '..', agreement.pdf_path))) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    const fileName = `rental_agreement_${rentalId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(path.join(__dirname, '..', agreement.pdf_path));
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download agreement error:', error);
    res.status(500).json({ error: 'Failed to download agreement' });
  }
};

const signAgreement = async (req, res) => {
  try {
    const { rentalId } = req.params;

    const agreement = await RentalAgreement.findByRentalId(rentalId);
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    // Check permissions
    const rental = await Rental.findById(rentalId);
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (agreement.signed_at) {
      return res.status(400).json({ error: 'Agreement already signed' });
    }

    await RentalAgreement.updateSignature(agreement.id);

    res.json({
      success: true,
      message: 'Agreement signed successfully'
    });
  } catch (error) {
    console.error('Sign agreement error:', error);
    res.status(500).json({ error: 'Failed to sign agreement' });
  }
};

const getAllAgreements = async (req, res) => {
  try {
    const { signed } = req.query;
    const filters = {};

    if (signed !== undefined) {
      filters.signed = signed === 'true';
    }

    const agreements = await RentalAgreement.findAll(filters);

    res.json({
      success: true,
      data: agreements
    });
  } catch (error) {
    console.error('Get all agreements error:', error);
    res.status(500).json({ error: 'Failed to fetch agreements' });
  }
};

// Helper function to generate PDF
async function generateAgreementPDF(rental, agreementText) {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'agreements');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `agreement_${rental.id}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    const relativePath = `uploads/agreements/${fileName}`;

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Add content to PDF
    doc.fontSize(20).text('EQUIPMENT RENTAL AGREEMENT', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Rental ID: ${rental.id}`);
    doc.text(`Equipment: ${rental.equipment_name}`);
    doc.text(`Customer: ${rental.first_name} ${rental.last_name}`);
    doc.text(`Email: ${rental.email}`);
    doc.text(`Phone: ${rental.phone}`);
    doc.text(`Rental Period: ${new Date(rental.start_date).toLocaleDateString()} - ${new Date(rental.end_date).toLocaleDateString()}`);
    doc.text(`Total Amount: $${rental.total_amount}`);
    doc.moveDown();

    doc.fontSize(14).text('TERMS AND CONDITIONS:', { underline: true });
    doc.moveDown();

    // Split agreement text and add to PDF
    const lines = agreementText.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        doc.fontSize(10).text(line.trim());
      } else {
        doc.moveDown(0.5);
      }
    });

    doc.end();

    stream.on('finish', () => resolve(relativePath));
    stream.on('error', reject);
  });
}

module.exports = {
  generateAgreement,
  getAgreement,
  downloadAgreement,
  signAgreement,
  getAllAgreements
};
