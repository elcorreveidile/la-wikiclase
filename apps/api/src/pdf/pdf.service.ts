import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async generateCertificate(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        course: {
          include: {
            instructor: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${enrollmentId} not found`);
    }

    if (enrollment.status !== 'COMPLETED') {
      throw new BadRequestException('Certificate can only be generated for completed courses');
    }

    // Check if certificate already exists
    const existingCertificate = await this.prisma.certificate.findFirst({
      where: { enrollmentId },
    });

    if (existingCertificate) {
      return existingCertificate;
    }

    // Generate certificate number
    const certificateNumber = await this.generateCertificateNumber();

    // Generate PDF
    const pdfBuffer = await this.createCertificatePdf(enrollment, certificateNumber);

    // Save PDF file (in a real app, you'd upload to cloud storage)
    const fileName = `certificate-${certificateNumber}.pdf`;
    const filePath = path.join(process.cwd(), 'uploads', 'certificates', fileName);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, pdfBuffer);

    // Create certificate record
    const certificate = await this.prisma.certificate.create({
      data: {
        enrollmentId,
        certificateNumber,
        pdfUrl: `/uploads/certificates/${fileName}`, // In production, use CDN URL
      },
    });

    return certificate;
  }

  private async generateCertificateNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get count of certificates for this month
    const count = await this.prisma.certificate.count({
      where: {
        issuedAt: {
          gte: new Date(date.getFullYear(), date.getMonth(), 1),
          lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `CERT-${year}${month}-${sequence}`;
  }

  private async createCertificatePdf(enrollment: any, certificateNumber: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add certificate content
      this.addCertificateContent(doc, enrollment, certificateNumber);

      doc.end();
    });
  }

  private addCertificateContent(doc: PDFKit.PDFDocument, enrollment: any, certificateNumber: string) {
    const { user, course, instructor } = enrollment;
    
    // Add border
    doc.lineWidth(3);
    doc.strokeColor('#2563eb');
    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke();

    // Title
    doc.fontSize(36)
      .fillColor('#1e293b')
      .font('Helvetica-Bold')
      .text('CERTIFICATE OF COMPLETION', {
        align: 'center',
      });

    doc.moveDown(1);

    // Subtitle
    doc.fontSize(18)
      .fillColor('#64748b')
      .font('Helvetica')
      .text('This is to certify that', {
        align: 'center',
      });

    doc.moveDown(0.5);

    // Student name
    doc.fontSize(28)
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .text(`${user.firstName} ${user.lastName || ''}`, {
        align: 'center',
      });

    doc.moveDown(0.5);

    // Course completion text
    doc.fontSize(16)
      .fillColor('#475569')
      .font('Helvetica')
      .text('has successfully completed the course', {
        align: 'center',
      });

    doc.moveDown(0.5);

    // Course title
    doc.fontSize(24)
      .fillColor('#1e293b')
      .font('Helvetica-Bold')
      .text(course.title, {
        align: 'center',
      });

    doc.moveDown(1);

    // Course details
    doc.fontSize(14)
      .fillColor('#64748b')
      .font('Helvetica')
      .text(`Instructor: ${instructor.firstName} ${instructor.lastName || ''}`, {
        align: 'center',
      });

    doc.moveDown(0.3);

    // Completion date
    const completionDate = enrollment.completedAt 
      ? enrollment.completedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    doc.text(`Completed on: ${completionDate}`, {
      align: 'center',
    });

    doc.moveDown(2);

    // Certificate number
    doc.fontSize(12)
      .fillColor('#94a3b8')
      .text(`Certificate Number: ${certificateNumber}`, {
        align: 'center',
      });

    // Signature lines
    const signatureY = doc.y + 50;
    const leftX = 100;
    const rightX = doc.page.width - 200;

    // Left signature line (Instructor)
    doc.moveTo(leftX, signatureY)
      .lineTo(leftX + 150, signatureY)
      .stroke();

    doc.fontSize(12)
      .fillColor('#64748b')
      .text('Instructor Signature', leftX, signatureY + 10, { width: 150 });

    // Right signature line (Date)
    doc.moveTo(rightX, signatureY)
      .lineTo(rightX + 150, signatureY)
      .stroke();

    doc.text('Date', rightX, signatureY + 10, { width: 150 });

    // Footer
    doc.fontSize(10)
      .fillColor('#94a3b8')
      .text('La Wikiclase - Educational Platform', {
        align: 'center',
      });
  }

  async getCertificate(id: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    return certificate;
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: {
        enrollment: {
          userId,
        },
      },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });
  }

  async getCourseCertificates(courseId: string) {
    return this.prisma.certificate.findMany({
      where: {
        enrollment: {
          courseId,
        },
      },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });
  }

  async verifyCertificate(certificateNumber: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
                instructor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with number ${certificateNumber} not found`);
    }

    return {
      isValid: true,
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        issuedAt: certificate.issuedAt,
        student: `${certificate.enrollment.user.firstName} ${certificate.enrollment.user.lastName || ''}`,
        course: certificate.enrollment.course.title,
        instructor: `${certificate.enrollment.course.instructor.firstName} ${certificate.enrollment.course.instructor.lastName || ''}`,
      },
    };
  }

  async getCertificateStats() {
    const certificates = await this.prisma.certificate.findMany();

    const totalCertificates = certificates.length;
    const certificatesThisMonth = certificates.filter(cert => {
      const certDate = new Date(cert.issuedAt);
      const now = new Date();
      return certDate.getMonth() === now.getMonth() && 
             certDate.getFullYear() === now.getFullYear();
    }).length;

    const certificatesThisYear = certificates.filter(cert => {
      return new Date(cert.issuedAt).getFullYear() === new Date().getFullYear();
    }).length;

    return {
      totalCertificates,
      certificatesThisMonth,
      certificatesThisYear,
    };
  }
}
