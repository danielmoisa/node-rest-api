import { controller, IAppController } from '@foal/core';
import { createConnection } from 'typeorm';
import { ApiController, OpenapiController } from './controllers';
export class AppController implements IAppController {
  subControllers = [
    controller('/api', ApiController),
    controller('/swagger', OpenapiController),
  ];

  async init() {
    await createConnection();
  }
}
