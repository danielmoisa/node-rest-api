import { ApiInfo, ApiServer, Context, controller, Get, HttpResponseOK, UseSessions } from '@foal/core';
import { fetchUser } from '@foal/typeorm';
import { ClientController, UsersController } from '.';
import { User } from '../entities';
import { AuthController, CampaignController } from './api';

@ApiInfo({
  title: 'Application API',
  version: '1.0.0'
})

@ApiServer({
  url: '/api'
})

@UseSessions({
  cookie: true,
  user: fetchUser(User),
})

export class ApiController {
  subControllers = [
    controller('/auth', AuthController),
    controller('/users', UsersController),
    controller('/campaigns', CampaignController),
    controller('/clients', ClientController)
  ];


  @Get('/')
  index(ctx: Context) {
    return new HttpResponseOK('Hello world!');
  }

}
