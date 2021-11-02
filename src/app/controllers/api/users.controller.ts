import { Context, Get, HttpResponseOK } from '@foal/core';
import { User } from '../../entities';

export class UsersController {

  @Get()
  async getUsers(ctx: Context) {
    const queryBuilder = User.createQueryBuilder('users');
    const users = await queryBuilder.getMany();

    return new HttpResponseOK(users);
  }

}
