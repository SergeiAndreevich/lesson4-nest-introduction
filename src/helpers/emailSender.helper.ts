import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const MAIL_RU_EMAIL = 'st.high@mail.ru';
const MAIL_RU_PASSWORD = 'wgEBU8anRSgtr4KVbl9x';
const onlysmpt = 'VTfzJbL4oJDuxUO5fM1A';

@Injectable()
export class EmailSenderHelper {
    private transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru', // e.g., Gmail, Outlook, etc.
        port: 465,           // 465 — для SSL (рекомендуется)
        secure: true,        // true, если порт 465
        auth: {
            user: process.env.SMTP_LOGIN || MAIL_RU_EMAIL,
            pass: process.env.SMTP_PASSWORD || MAIL_RU_PASSWORD,
        },
    });

    async send(to: string, subject: string, code: string) {
        return this.transporter.sendMail({
            from: `"Bloggers Platform" <${MAIL_RU_EMAIL}>`,
            to,
            subject,
            html:  `<div>
                <h1>HI MAN, YO</h1>
                <a href='https://somesite.com/confirm?code=${code}'>complete acomplishing</a>
           </div>`
        });
    }

    async sendEmailConfirmation(email: string, code: string) {
        const subject = 'Email confirmation';
        return this.send(email, subject, code);
    }

    async sendRecoveryPassword(email: string, code: string) {
        const subject = 'Password recovery';
        return this.send(email, subject, code);
    }
}
