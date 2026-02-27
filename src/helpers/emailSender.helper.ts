import {Injectable, Logger} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const MAIL_RU_EMAIL = 'st.high@mail.ru';
const MAIL_RU_PASSWORD = 'wgEBU8anRSgtr4KVbl9x';
const onlysmpt = 'VTfzJbL4oJDuxUO5fM1A';

const GMAIL_EMAIL = 'sergeytroshin00@gmail.com';
const GMAIL_PASSWORD = 'entn qxpq qozb jync';

@Injectable()
export class EmailSenderHelper {
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_LOGIN || GMAIL_EMAIL,
            pass: process.env.SMTP_PASSWORD || GMAIL_PASSWORD,
        },
    });

    async send(to: string, subject: string, code: string) {
        return this.transporter.sendMail({
            from: '"Bloggers Platform" <sergeytroshin00@gmail.com>',
            to,
            subject,
            html:  `<div>
                <h1>HI MAN, wassap</h1>
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
    // async sendEmailConfirmation(email: string, code: string) {
    //     console.log(`EMAIL CONFIRMATION SEND TO ${email} WITH CODE ${code}`);
    //     return true; // ВСЕГДА успешный результат !!!
    // }
    //
    // async sendRecoveryPassword(email: string, code: string) {
    //     console.log(`RECOVERY PASSWORD TO ${email} WITH CODE ${code}`);
    //     return true;
    // }
}

// @Injectable()
// export class EmailSenderHelper {
//     private transporter;
//
//     constructor() {
//         nodemailer.createTestAccount().then((testAccount) => {
//             this.transporter = nodemailer.createTransport({
//                 host: testAccount.smtp.host,
//                 port: testAccount.smtp.port,
//                 secure: testAccount.smtp.secure,
//                 auth: {
//                     user: testAccount.user,
//                     pass: testAccount.pass,
//                 },
//             });
//         });
//     }
//
//     sendEmailConfirmation(email: string, subject:string, code: string) {
//         // const info = await this.transporter.sendMail({
//         //     to: email,
//         //     subject: 'Email confirmation (TEST)',
//         //     text: `Your confirmation code: ${code}`,
//         // });
//         console.log(`Email sent to ${email} with ${subject}: "email confirmation code" and body: "${code}"`);
//         //Logger.log(`Mock email sent: ${nodemailer.getTestMessageUrl(info)}`);
//         //return
//         // 2. ВАЖНО: записать код в тестовое хранилище
//
//         return true
//     }
//
//     sendPasswordRecovery(email: string, subject: string, code: string) {
//         const info = this.transporter.sendMail({
//             to: email,
//             subject: `${subject}`,
//             text: `Your recovery code: ${code}`,
//         });
//
//         Logger.log(`Mock email sent: ${nodemailer.getTestMessageUrl(info)}`);
//         return
//     }
// }