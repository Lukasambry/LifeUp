import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;
  private readonly fromAddress: string;
  private readonly isDev: boolean;

  constructor(private readonly config: ConfigService) {
    this.isDev = config.get('NODE_ENV') !== 'production';
    this.fromAddress =
      config.get<string>('MAIL_FROM') || 'LifeUp <noreply@lifeup.app>';

    const host = config.get<string>('SMTP_HOST');

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: config.get<number>('SMTP_PORT') || 587,
        secure: config.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: config.get<string>('SMTP_USER'),
          pass: config.get<string>('SMTP_PASS'),
        },
      });
      this.logger.log(`Mail transport configured: ${host}`);
    } else {
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      this.logger.warn(
        'No SMTP_HOST configured — emails will be logged to console',
      );
    }
  }

  async send(options: SendMailOptions): Promise<void> {
    const mailOptions = {
      from: this.fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      if (!this.config.get<string>('SMTP_HOST')) {
        const parsed = JSON.parse(info.message);
        this.logger.debug(
          `[DEV MAIL] To: ${parsed.to} | Subject: ${parsed.subject}`,
        );
        this.logger.debug(`[DEV MAIL] Body:\n${options.text || options.html}`);
      } else {
        this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const appUrl =
      this.config.get<string>('APP_URL') || 'http://localhost:3001';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await this.send({
      to,
      subject: 'LifeUp — Réinitialisation de mot de passe',
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe LifeUp.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien expire dans <strong>15 minutes</strong>.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        <hr/>
        <p style="color:#888;font-size:12px;">LifeUp — Gamifie ta vie.</p>
      `,
      text: `Réinitialisation de mot de passe LifeUp\n\nCliquez sur ce lien (valide 15 min) :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
    });
  }

  async sendMagicLink(to: string, token: string): Promise<void> {
    const appUrl =
      this.config.get<string>('APP_URL') || 'http://localhost:3001';
    const magicUrl = `${appUrl}/auth/magic-link?token=${token}`;

    await this.send({
      to,
      subject: 'LifeUp — Connexion par lien magique',
      html: `
        <h2>Connexion à LifeUp</h2>
        <p>Cliquez sur le bouton ci-dessous pour vous connecter :</p>
        <p><a href="${magicUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;">Se connecter</a></p>
        <p>Ce lien expire dans <strong>15 minutes</strong>.</p>
        <hr/>
        <p style="color:#888;font-size:12px;">LifeUp — Gamifie ta vie.</p>
      `,
      text: `Connexion à LifeUp\n\nCliquez sur ce lien (valide 15 min) :\n${magicUrl}`,
    });
  }
}
