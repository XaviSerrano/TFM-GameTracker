import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASS'),
      },
    });
  }

  async sendPasswordReset(to: string, token: string) {
    const url = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"GameTracker" <${this.config.get('MAIL_USER')}>`,
      to,
      subject: 'Recuperación de contraseña',
      html: `
        <h2>¿Olvidaste tu contraseña?</h2>
        <p>Haz clic en el botón para restablecerla. El enlace expira en 1 hora.</p>
        <a href="${url}" style="
          display:inline-block;
          padding:12px 24px;
          background:#6c63ff;
          color:white;
          border-radius:8px;
          text-decoration:none;
          font-weight:bold;
        ">Restablecer contraseña</a>
        <p>Si no solicitaste esto, ignora este email.</p>
      `,
    });
  }
}