import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import {EmailService} from "./mailNotification.service";

const GMAIL_EMAIL = 'sergeytroshin00@gmail.com';
const GMAIL_PASSWORD = 'entn qxpq qozb jync';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: () => ({
                transport:
                     {
                            service: 'gmail',
                            auth: {
                                user: process.env.SMTP_EMAIL || GMAIL_EMAIL,
                                pass: process.env.SMTP_PASSWORD || GMAIL_PASSWORD,
                            },
                    },
            }),
        }),
    ],
    providers: [EmailService],
    exports: [EmailService],
})
export class NotificationsModule {}

// process.env.NODE_ENV === 'test'
//     ? {
//         host: 'mailhog',
//         port: 1025,
//         secure: false,
//         ignoreTLS: true,
//     }
//     :