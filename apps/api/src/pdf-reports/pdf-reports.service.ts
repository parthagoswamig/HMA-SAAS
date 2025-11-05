import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';

@Injectable()
export class PdfReportsService {
  private async ensureTmpDir() {
    const tmpDir = join(process.cwd(), 'tmp');
    try {
      await mkdir(tmpDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
    return tmpDir;
  }

  async generateInvoicePdf(invoice: any): Promise<string> {
    const tmpDir = await this.ensureTmpDir();
    const filename = `invoice-${invoice.id}-${Date.now()}.pdf`;
    const filepath = join(tmpDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(24)
        .text('INVOICE', { align: 'center' })
        .moveDown();

      // Invoice Details
      doc.fontSize(12);
      doc.text(`Invoice Number: ${invoice.invoiceNumber || invoice.id}`, { align: 'left' });
      doc.text(`Date: ${new Date(invoice.date || invoice.createdAt).toLocaleDateString()}`);
      doc.text(`Status: ${invoice.status}`);
      doc.moveDown();

      // Patient Information
      doc.fontSize(14).text('Bill To:', { underline: true });
      doc.fontSize(12);
      if (invoice.patient) {
        doc.text(`${invoice.patient.firstName} ${invoice.patient.lastName || ''}`);
        if (invoice.patient.phone) doc.text(`Phone: ${invoice.patient.phone}`);
        if (invoice.patient.email) doc.text(`Email: ${invoice.patient.email}`);
      }
      doc.moveDown();

      // Items Table
      doc.fontSize(14).text('Items:', { underline: true });
      doc.moveDown(0.5);

      if (invoice.items && invoice.items.length > 0) {
        // Table header
        doc.fontSize(10);
        const tableTop = doc.y;
        doc.text('Description', 50, tableTop, { width: 200 });
        doc.text('Qty', 250, tableTop, { width: 50 });
        doc.text('Price', 300, tableTop, { width: 80 });
        doc.text('Total', 380, tableTop, { width: 80 });
        doc.moveDown();

        // Table rows
        invoice.items.forEach((item: any) => {
          const y = doc.y;
          doc.text(item.description || 'Item', 50, y, { width: 200 });
          doc.text(item.quantity?.toString() || '1', 250, y, { width: 50 });
          doc.text(`₹${item.unitPrice || 0}`, 300, y, { width: 80 });
          doc.text(`₹${item.totalAmount || 0}`, 380, y, { width: 80 });
          doc.moveDown();
        });
      }

      doc.moveDown();

      // Totals
      doc.fontSize(12);
      const totalsX = 350;
      if (invoice.subTotal) {
        doc.text(`Subtotal:`, totalsX - 100, doc.y);
        doc.text(`₹${invoice.subTotal}`, totalsX, doc.y - 15, { align: 'right' });
      }
      if (invoice.taxAmount) {
        doc.text(`Tax:`, totalsX - 100, doc.y);
        doc.text(`₹${invoice.taxAmount}`, totalsX, doc.y - 15, { align: 'right' });
      }
      if (invoice.discountAmount) {
        doc.text(`Discount:`, totalsX - 100, doc.y);
        doc.text(`-₹${invoice.discountAmount}`, totalsX, doc.y - 15, { align: 'right' });
      }

      doc.moveDown();
      doc.fontSize(14);
      doc.text(`Total Amount:`, totalsX - 100, doc.y);
      doc.text(`₹${invoice.totalAmount || 0}`, totalsX, doc.y - 15, { align: 'right' });

      // Footer
      doc.moveDown(2);
      doc.fontSize(10);
      doc.text('Thank you for your business!', { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }

  async generatePrescriptionPdf(prescription: any): Promise<string> {
    const tmpDir = await this.ensureTmpDir();
    const filename = `prescription-${prescription.id}-${Date.now()}.pdf`;
    const filepath = join(tmpDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(24)
        .text('PRESCRIPTION', { align: 'center' })
        .moveDown();

      // Prescription Details
      doc.fontSize(12);
      doc.text(`Prescription ID: ${prescription.id}`);
      doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
      doc.moveDown();

      // Patient Information
      doc.fontSize(14).text('Patient:', { underline: true });
      doc.fontSize(12);
      if (prescription.patient) {
        doc.text(`Name: ${prescription.patient.firstName} ${prescription.patient.lastName || ''}`);
        doc.text(`Age: ${prescription.patient.age || 'N/A'}`);
        doc.text(`Gender: ${prescription.patient.gender || 'N/A'}`);
      }
      doc.moveDown();

      // Doctor Information
      if (prescription.doctor) {
        doc.fontSize(14).text('Prescribed by:', { underline: true });
        doc.fontSize(12);
        doc.text(`Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName || ''}`);
        if (prescription.doctor.specialization) {
          doc.text(`Specialization: ${prescription.doctor.specialization}`);
        }
        doc.moveDown();
      }

      // Medications
      doc.fontSize(14).text('Medications:', { underline: true });
      doc.moveDown(0.5);

      if (prescription.items && prescription.items.length > 0) {
        prescription.items.forEach((item: any, index: number) => {
          doc.fontSize(12);
          doc.text(`${index + 1}. ${item.medication || item.name || 'Medication'}`);
          doc.fontSize(10);
          if (item.dosage) doc.text(`   Dosage: ${item.dosage}`);
          if (item.frequency) doc.text(`   Frequency: ${item.frequency}`);
          if (item.duration) doc.text(`   Duration: ${item.duration}`);
          if (item.instructions) doc.text(`   Instructions: ${item.instructions}`);
          doc.moveDown(0.5);
        });
      }

      // Notes
      if (prescription.notes) {
        doc.moveDown();
        doc.fontSize(14).text('Notes:', { underline: true });
        doc.fontSize(12).text(prescription.notes);
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(10);
      doc.text('This is a computer-generated prescription.', { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }

  async generateDischargeSummaryPdf(discharge: any): Promise<string> {
    const tmpDir = await this.ensureTmpDir();
    const filename = `discharge-${discharge.id}-${Date.now()}.pdf`;
    const filepath = join(tmpDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(24)
        .text('DISCHARGE SUMMARY', { align: 'center' })
        .moveDown();

      // Patient Information
      doc.fontSize(14).text('Patient Information:', { underline: true });
      doc.fontSize(12);
      if (discharge.patient) {
        doc.text(`Name: ${discharge.patient.firstName} ${discharge.patient.lastName || ''}`);
        doc.text(`MRN: ${discharge.patient.medicalRecordNumber || 'N/A'}`);
        doc.text(`Age: ${discharge.patient.age || 'N/A'}`);
        doc.text(`Gender: ${discharge.patient.gender || 'N/A'}`);
      }
      doc.moveDown();

      // Admission Details
      doc.fontSize(14).text('Admission Details:', { underline: true });
      doc.fontSize(12);
      doc.text(`Admission Date: ${new Date(discharge.admissionDate || discharge.createdAt).toLocaleDateString()}`);
      doc.text(`Discharge Date: ${new Date(discharge.dischargeDate || Date.now()).toLocaleDateString()}`);
      if (discharge.diagnosis) doc.text(`Diagnosis: ${discharge.diagnosis}`);
      doc.moveDown();

      // Treatment Summary
      if (discharge.treatmentSummary) {
        doc.fontSize(14).text('Treatment Summary:', { underline: true });
        doc.fontSize(12).text(discharge.treatmentSummary);
        doc.moveDown();
      }

      // Discharge Instructions
      if (discharge.instructions) {
        doc.fontSize(14).text('Discharge Instructions:', { underline: true });
        doc.fontSize(12).text(discharge.instructions);
        doc.moveDown();
      }

      // Follow-up
      if (discharge.followUp) {
        doc.fontSize(14).text('Follow-up:', { underline: true });
        doc.fontSize(12).text(discharge.followUp);
        doc.moveDown();
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(10);
      doc.text('This is a computer-generated discharge summary.', { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }
}
