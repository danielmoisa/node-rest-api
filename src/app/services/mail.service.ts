import * as nodemailer from 'nodemailer';
import { User } from '../entities';

const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        // mail trap account info
    }
});

export class MailService {
    async verifyEmail(token: string, user: User) {

        // send mail with defined transport object
        await transport.sendMail({
            from: '"Test" <admin@test.ro>', // sender address
            to: `${user.email}`, // list of receivers
            subject: 'Confirm email address', // Subject line
            html: `<b>Hi ${user.firstName}, follow this link to activate account your account: <a href="http://localhost:3001/api/auth/verify/${token}">click</a></b>`, // html body
        });
    }

    // async resetPasswordEmail(token: string, user: User) {

    //     // send mail with defined transport object
    //     await transport.sendMail({
    //         from: '"test.ro" <admin@test.ro>', // sender address
    //         to: `${user.email}`, // list of receivers
    //         subject: 'Confirm email address', // Subject line
    //         html: `<b>Hi ${user.firstName}, follow this link to activate account your account: <a href="http://localhost:3001/api/auth/verify/${token}">click</a></b>`, // html body
    //     });
    // }
}
