import { ApiUseTag, Context, Get, HttpResponseOK, UserRequired } from '@foal/core';
import { User } from '../../entities';

@ApiUseTag('user')
@UserRequired()
export class UsersController {

  @Get()
  async getUsers(ctx: Context) {
    const queryBuilder = User.createQueryBuilder('users');
    const users = await queryBuilder.getMany();

    return new HttpResponseOK(users);
  }

}
