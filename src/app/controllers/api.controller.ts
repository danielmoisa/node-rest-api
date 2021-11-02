import { ApiInfo, ApiServer, Context, controller, Get, HttpResponseOK, UseSessions } from '@foal/core';
import { fetchUser } from '@foal/typeorm';
import { UsersController } from '.';
import { User } from '../entities';
import { AuthController, CampaignController, ClientsController } from './api';

@ApiInfo({
  title: 'Application API - Updigital',
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
    controller('/clients', ClientsController),
    controller('/auth', AuthController),
    controller('/users', UsersController),
    controller('/campaigns', CampaignController)
  ];


  @Get('/')
  index(ctx: Context) {
    return new HttpResponseOK('Hello world!');
  }

}
