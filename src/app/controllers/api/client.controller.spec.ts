// std
import { notStrictEqual, ok, strictEqual } from 'assert';

// 3p
import {
  Context, createController, getHttpMethod, getPath,
  isHttpResponseCreated, isHttpResponseNoContent,
  isHttpResponseNotFound, isHttpResponseOK
} from '@foal/core';
import { createConnection, getConnection, getRepository } from 'typeorm';

// App
import { Client } from '../entities';
import { ClientController } from './client.controller';

describe('ClientController', () => {

  let controller: ClientController;
  let client1: Client;
  let client2: Client;

  before(() => createConnection());

  after(() => getConnection().close());

  beforeEach(async () => {
    controller = createController(ClientController);

    const repository = getRepository(Client);
    await repository.clear();
    [ client1, client2 ] = await repository.save([
      {
        text: 'Client 1'
      },
      {
        text: 'Client 2'
      },
    ]);
  });

  describe('has a "findClients" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(ClientController, 'findClients'), 'GET');
      strictEqual(getPath(ClientController, 'findClients'), undefined);
    });

    it('should return an HttpResponseOK object with the client list.', async () => {
      const ctx = new Context({ query: {} });
      const response = await controller.findClients(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      if (!Array.isArray(response.body)) {
        throw new Error('The response body should be an array of clients.');
      }

      strictEqual(response.body.length, 2);
      ok(response.body.find(client => client.text === client1.text));
      ok(response.body.find(client => client.text === client2.text));
    });

    it('should support pagination', async () => {
      const client3 = await getRepository(Client).save({
        text: 'Client 3',
      });

      let ctx = new Context({
        query: {
          take: 2
        }
      });
      let response = await controller.findClients(ctx);

      strictEqual(response.body.length, 2);
      ok(response.body.find(client => client.id === client1.id));
      ok(response.body.find(client => client.id === client2.id));
      ok(!response.body.find(client => client.id === client3.id));

      ctx = new Context({
        query: {
          skip: 1
        }
      });
      response = await controller.findClients(ctx);

      strictEqual(response.body.length, 2);
      ok(!response.body.find(client => client.id === client1.id));
      ok(response.body.find(client => client.id === client2.id));
      ok(response.body.find(client => client.id === client3.id));
    });

  });

  describe('has a "findClientById" method that', () => {

    it('should handle requests at GET /:clientId.', () => {
      strictEqual(getHttpMethod(ClientController, 'findClientById'), 'GET');
      strictEqual(getPath(ClientController, 'findClientById'), '/:clientId');
    });

    it('should return an HttpResponseOK object if the client was found.', async () => {
      const ctx = new Context({
        params: {
          clientId: client2.id
        }
      });
      const response = await controller.findClientById(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      strictEqual(response.body.id, client2.id);
      strictEqual(response.body.text, client2.text);
    });

    it('should return an HttpResponseNotFound object if the client was not found.', async () => {
      const ctx = new Context({
        params: {
          clientId: -1
        }
      });
      const response = await controller.findClientById(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "createClient" method that', () => {

    it('should handle requests at POST /.', () => {
      strictEqual(getHttpMethod(ClientController, 'createClient'), 'POST');
      strictEqual(getPath(ClientController, 'createClient'), undefined);
    });

    it('should create the client in the database and return it through '
        + 'an HttpResponseCreated object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Client 3',
        }
      });
      const response = await controller.createClient(ctx);

      if (!isHttpResponseCreated(response)) {
        throw new Error('The returned value should be an HttpResponseCreated object.');
      }

      const client = await getRepository(Client).findOne({ text: 'Client 3' });

      if (!client) {
        throw new Error('No client 3 was found in the database.');
      }

      strictEqual(client.text, 'Client 3');

      strictEqual(response.body.id, client.id);
      strictEqual(response.body.text, client.text);
    });

  });

  describe('has a "modifyClient" method that', () => {

    it('should handle requests at PATCH /:clientId.', () => {
      strictEqual(getHttpMethod(ClientController, 'modifyClient'), 'PATCH');
      strictEqual(getPath(ClientController, 'modifyClient'), '/:clientId');
    });

    it('should update the client in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Client 2 (version 2)',
        },
        params: {
          clientId: client2.id
        }
      });
      const response = await controller.modifyClient(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const client = await getRepository(Client).findOne(client2.id);

      if (!client) {
        throw new Error();
      }

      strictEqual(client.text, 'Client 2 (version 2)');

      strictEqual(response.body.id, client.id);
      strictEqual(response.body.text, client.text);
    });

    it('should not update the other clients.', async () => {
      const ctx = new Context({
        body: {
          text: 'Client 2 (version 2)',
        },
        params: {
          clientId: client2.id
        }
      });
      await controller.modifyClient(ctx);

      const client = await getRepository(Client).findOne(client1.id);

      if (!client) {
        throw new Error();
      }

      notStrictEqual(client.text, 'Client 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          clientId: -1
        }
      });
      const response = await controller.modifyClient(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "replaceClient" method that', () => {

    it('should handle requests at PUT /:clientId.', () => {
      strictEqual(getHttpMethod(ClientController, 'replaceClient'), 'PUT');
      strictEqual(getPath(ClientController, 'replaceClient'), '/:clientId');
    });

    it('should update the client in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Client 2 (version 2)',
        },
        params: {
          clientId: client2.id
        }
      });
      const response = await controller.replaceClient(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const client = await getRepository(Client).findOne(client2.id);

      if (!client) {
        throw new Error();
      }

      strictEqual(client.text, 'Client 2 (version 2)');

      strictEqual(response.body.id, client.id);
      strictEqual(response.body.text, client.text);
    });

    it('should not update the other clients.', async () => {
      const ctx = new Context({
        body: {
          text: 'Client 2 (version 2)',
        },
        params: {
          clientId: client2.id
        }
      });
      await controller.replaceClient(ctx);

      const client = await getRepository(Client).findOne(client1.id);

      if (!client) {
        throw new Error();
      }

      notStrictEqual(client.text, 'Client 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          clientId: -1
        }
      });
      const response = await controller.replaceClient(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "deleteClient" method that', () => {

    it('should handle requests at DELETE /:clientId.', () => {
      strictEqual(getHttpMethod(ClientController, 'deleteClient'), 'DELETE');
      strictEqual(getPath(ClientController, 'deleteClient'), '/:clientId');
    });

    it('should delete the client and return an HttpResponseNoContent object.', async () => {
      const ctx = new Context({
        params: {
          clientId: client2.id
        }
      });
      const response = await controller.deleteClient(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const client = await getRepository(Client).findOne(client2.id);

      strictEqual(client, undefined);
    });

    it('should not delete the other clients.', async () => {
      const ctx = new Context({
        params: {
          clientId: client2.id
        }
      });
      const response = await controller.deleteClient(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const client = await getRepository(Client).findOne(client1.id);

      notStrictEqual(client, undefined);
    });

    it('should return an HttpResponseNotFound if the client was not found.', async () => {
      const ctx = new Context({
        params: {
          clientId: -1
        }
      });
      const response = await controller.deleteClient(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

});
