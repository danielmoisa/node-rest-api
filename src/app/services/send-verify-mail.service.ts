import * as nodemailer from 'nodemailer';
import { User } from '../entities';

const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '9f587adeb63f47',
        pass: 'aba6166d9771c6'
    }
});

export class SendVerifyMail {
    async send(token: string, user: User) {

        // send mail with defined transport object
        await transport.sendMail({
            from: '"Updigital.ro" <admin@updigital.ro>', // sender address
            to: `${user.email}`, // list of receivers
            subject: 'Confirm email address', // Subject line
            html: `<b>Hi ${user.firstName}, follow this link to activate account your account: <a href="http://localhost:3001/api/auth/verify/${token}">click</a></b>`, // html body
        });
    }
}
