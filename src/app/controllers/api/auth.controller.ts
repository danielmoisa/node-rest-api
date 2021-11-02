import { ApiUseTag, Context, dependency, Get, hashPassword, HttpResponseNoContent, HttpResponseOK, HttpResponseUnauthorized, Post, Session, ValidateBody, verifyPassword } from '@foal/core';
import { User } from '../../entities';
import { getSecretOrPrivateKey } from '@foal/jwt';
import { sign } from 'jsonwebtoken';
import { MailService } from '../../services';

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
@ApiUseTag('auth')
export class AuthController {
  @dependency
  mailService: MailService

  @Post('/signup')
  @ValidateBody(signupSchema)
  async signup(ctx: Context<User | undefined, Session>) {
    const email = ctx.request.body.email;
    const password = ctx.request.body.password;
    const firstName = ctx.request.body.firstName;
    const lastName = ctx.request.body.lastName;

    const user = new User();
    user.email = email;
    const token = sign(
      { email: user.email },
      getSecretOrPrivateKey(),
    );

    user.firstName = firstName;
    user.lastName = lastName;
    user.password = await hashPassword(password);
    user.emailConfirmationCode = token;
    await user.save();

    ctx.session.setUser(user);
    ctx.user = user;

    this.mailService.verifyEmail(token, user);

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
