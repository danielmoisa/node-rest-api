import { controller, IAppController } from '@foal/core';
import { createConnection } from 'typeorm';

import { ApiController, OpenapiController, UsersController } from './controllers';

export class AppController implements IAppController {
  subControllers = [
    controller('/api', ApiController),
    controller('/openapi', OpenapiController),
    controller('/user', UsersController)
  ];

  async init() {
    await createConnection();
  }
}
