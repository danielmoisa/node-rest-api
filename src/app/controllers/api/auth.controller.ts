import { Context, hashPassword, HttpResponseNoContent, HttpResponseOK, HttpResponseUnauthorized, Post, Session, ValidateBody, verifyPassword } from '@foal/core';
import { User } from '../../entities';

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
    await user.save();

    ctx.session.setUser(user);
    ctx.user = user;

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

}
