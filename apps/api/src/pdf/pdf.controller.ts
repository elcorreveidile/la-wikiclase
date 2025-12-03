import { Controller, Get, Post, Body, Param, Headers, Res, NotFoundException, BadRequestException } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { Response } from 'express';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('certificates')
  async generateCertificate(@Body() body: { enrollmentId: string }) {
    if (!body.enrollmentId) {
      throw new BadRequestException('Enrollment ID is required');
    }
    return this.pdfService.generateCertificate(body.enrollmentId);
  }

  @Get('certificates/:id')
  async getCertificate(@Param('id') id: string) {
    return this.pdfService.getCertificate(id);
  }

  @Get('certificates/:id/download')
  async downloadCertificate(@Param('id') id: string, @Res() res: Response) {
    try {
      const certificate = await this.pdfService.getCertificate(id);
      
      // In a real implementation, you would serve the PDF from cloud storage
      // For now, we'll generate it on the fly
      const enrollment = await this.pdfService['prisma'].enrollment.findUnique({
        where: { id: certificate.enrollmentId },
        include: {
          user: true,
          course: {
            include: {
              instructor: true,
            },
          },
        },
      });

      const pdfBuffer = await this.pdfService['createCertificatePdf'](enrollment, certificate.certificateNumber);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.certificateNumber}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      throw new NotFoundException('Certificate not found');
    }
  }

  @Get('certificates/user/:userId')
  async getUserCertificates(@Param('userId') userId: string) {
    return this.pdfService.getUserCertificates(userId);
  }

  @Get('certificates/course/:courseId')
  async getCourseCertificates(@Param('courseId') courseId: string) {
    return this.pdfService.getCourseCertificates(courseId);
  }

  @Get('certificates/verify/:certificateNumber')
  async verifyCertificate(@Param('certificateNumber') certificateNumber: string) {
    return this.pdfService.verifyCertificate(certificateNumber);
  }

  @Get('certificates/stats')
  async getCertificateStats() {
    return this.pdfService.getCertificateStats();
  }
}
