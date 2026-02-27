import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    constructor(private mailerService: MailerService) {}

    async sendConfirmationEmail(email: string, code: string): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Email confirmation',
                html: `<a href="https://example.com/confirm?code=${code}">confirm</a>`
            });
        } catch (e) {
            console.error('SMTP error', e);
            throw new Error('Email sending failed');
        }
    }
}
