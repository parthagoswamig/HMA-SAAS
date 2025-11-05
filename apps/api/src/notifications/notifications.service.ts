import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: Number(process.env.EMAIL_SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_SMTP_USER,
      pass: process.env.EMAIL_SMTP_PASS,
    },
  });

  constructor(private prisma: PrismaService) {}

  async inApp(tenantId: string, userId: string | null, title: string, body?: string) {
    return this.prisma.notification.create({
      data: { tenantId, userId: userId ?? undefined, title, message: body || '' },
    });
  }

  async email(to: string, subject: string, html: string) {
    if (!process.env.EMAIL_SMTP_HOST) return { skipped: true };
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@yourapp.com',
      to,
      subject,
      html,
    });
    return { sent: true };
  }
}
