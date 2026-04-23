const nodemailer = require('nodemailer');

const { env } = require('../../config/env');
const { AppError } = require('../../utils/app-error');

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

class PasswordResetEmailService {
  constructor({
    appBaseUrl = env.APP_BASE_URL,
    smtpHost = env.SMTP_HOST,
    smtpPort = env.SMTP_PORT,
    smtpSecure = env.SMTP_SECURE,
    smtpUser = env.SMTP_USER,
    smtpPass = env.SMTP_PASS,
    smtpFrom = env.SMTP_FROM,
  } = {}) {
    this.appBaseUrl = trimTrailingSlash(appBaseUrl);
    this.smtpHost = smtpHost;
    this.smtpPort = smtpPort;
    this.smtpSecure = smtpSecure;
    this.smtpUser = smtpUser;
    this.smtpPass = smtpPass;
    this.smtpFrom = smtpFrom;
  }

  isConfigured() {
    return Boolean(this.appBaseUrl && this.smtpHost && this.smtpPort && this.smtpFrom);
  }

  buildResetUrl(token) {
    return `${this.appBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  createTransporter() {
    if (!this.isConfigured()) {
      throw new AppError(
        'Password reset email service is not configured',
        503,
        'EMAIL_NOT_CONFIGURED',
      );
    }

    return nodemailer.createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpSecure,
      ...(this.smtpUser && this.smtpPass
        ? {
            auth: {
              user: this.smtpUser,
              pass: this.smtpPass,
            },
          }
        : {}),
    });
  }

  async sendPasswordResetEmail({ email, firstName, token, expiresInMinutes }) {
    const resetUrl = this.buildResetUrl(token);
    const displayName = firstName || 'Bonjour';
    const transporter = this.createTransporter();

    await transporter.sendMail({
      from: this.smtpFrom,
      to: email,
      subject: 'SmartCard - Reinitialisation de votre mot de passe',
      text: [
        `${displayName},`,
        '',
        'Nous avons recu une demande de reinitialisation de mot de passe pour votre compte SmartCard.',
        `Ce lien reste valable ${expiresInMinutes} minutes :`,
        resetUrl,
        '',
        "Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.",
      ].join('\n'),
      html: `
        <p>${displayName},</p>
        <p>Nous avons recu une demande de reinitialisation de mot de passe pour votre compte SmartCard.</p>
        <p>Ce lien reste valable <strong>${expiresInMinutes} minutes</strong>.</p>
        <p><a href="${resetUrl}">Reinitialiser mon mot de passe</a></p>
        <p>Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.</p>
      `,
    });

    return resetUrl;
  }
}

module.exports = { PasswordResetEmailService };
