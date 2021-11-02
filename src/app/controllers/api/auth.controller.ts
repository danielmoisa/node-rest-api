import { Context, Get, hashPassword, HttpResponseNoContent, HttpResponseOK, HttpResponseUnauthorized, Post, Session, ValidateBody, ValidateQueryParam, verifyPassword } from '@foal/core';
import { User } from '../../entities';
import { decode, sign } from 'jsonwebtoken';
import { getSecretOrPrivateKey } from '@foal/jwt';
import * as nodemailer from 'nodemailer';


const transport = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '9f587adeb63f47',
    pass: 'aba6166d9771c6'
  }
});


const credentialsSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string' }
  },
  required: ['email', 'password'],
  additionalProperties: false,
};

const signupSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string' },
    firstName: { type: 'string', maxLength: 255 },
    lastName: { type: 'string', maxLength: 255 },
  },
  required: ['email', 'password', 'firstName', 'lastName'],
  additionalProperties: false,
};

export class AuthController {

  @Post('/signup')
  @ValidateBody(signupSchema)
  async signup(ctx: Context<User | undefined, Session>) {
    const email = ctx.request.body.email;
    const password = ctx.request.body.password;
    const firstName = ctx.request.body.firstName;
    const lastName = ctx.request.body.lastName;


    const user = new User();
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.password = await hashPassword(password);

    const token = sign(
      { email: user.email },
      getSecretOrPrivateKey(),
    );

    user.emailConfirmationCode = token;
    await user.save();

    ctx.session.setUser(user);
    ctx.user = user;

    // send mail with defined transport object
    await transport.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: 'bar@example.com, baz@example.com', // list of receivers
      subject: 'Hello ✔', // Subject line
      text: 'Hello world?', // plain text body
      // eslint-disable-next-line @typescript-eslint/quotes
      html: `<b>Activate account: <a href="http://localhost:3001/api/auth/verify/${token}">here</a></b>`, // html body
    });

    return new HttpResponseOK({
      id: user.id,
    });
  }

  @Post('/login')
  @ValidateBody(credentialsSchema)
  async login(ctx: Context<User | undefined, Session>) {
    const email = ctx.request.body.email;
    const password = ctx.request.body.password;

    const user = await User.findOne({ email });
    if (!user) {
      return new HttpResponseUnauthorized();
    }

    if (!(await verifyPassword(password, user.password))) {
      return new HttpResponseUnauthorized();
    }

    ctx.session.setUser(user);
    ctx.user = user;

    return new HttpResponseOK({
      id: user.id,
    });
  }

  @Post('/logout')
  async logout(ctx: Context<User | undefined, Session>) {
    await ctx.session.destroy();
    return new HttpResponseNoContent();
  }

  @Get('/verify/:code')
  // @ValidateQueryParam('code', { type: 'string' }, { required: true })
  async verifyEmail(ctx: Context<User, Session>) {
    const code = ctx.request.params.code as string;
    // const decodedToken = decode(code)
    // console.log('decoded token', decodedToken)

    let queryBuilder = User.createQueryBuilder('user');


    if (code) {
      queryBuilder = queryBuilder.where('user.emailConfirmationCode = :code', { code });
    }

    const user = await queryBuilder.getOne();

    if (user) {
      queryBuilder
        .update(User)
        .set({ isVerified: true })
        .where('id = :id', { id: user.id })
        .execute();
    } else {
      return new HttpResponseOK('Invalid token!');
    }

    return new HttpResponseOK('Email has been activated!');
  }
}
