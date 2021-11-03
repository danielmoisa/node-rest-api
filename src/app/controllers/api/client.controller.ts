import {
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { Client } from '../../entities';

const clientSchema = {
  additionalProperties: false,
  properties: {
    firstName: { type: 'string', maxLength: 255 },
    lastname: { type: 'string', maxLength: 255 },
    website: { type: 'string', maxLength: 255 },
    userId: { type: 'number' }
  },
  required: ['firstName', 'lastName', 'website', 'userId'],
  type: 'object',
};

@ApiUseTag('client')
@UserRequired()
export class ClientController {

  @Get()
  @ApiOperationId('findClients')
  @ApiOperationSummary('Find clients.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of clients.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  async findClients(ctx: Context) {
    const clients = await getRepository(Client).find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {},
    });
    return new HttpResponseOK(clients);
  }

  @Get('/:clientId')
  @ApiOperationId('findClientById')
  @ApiOperationSummary('Find a client by ID.')
  @ApiResponse(404, { description: 'Client not found.' })
  @ApiResponse(200, { description: 'Returns the client.' })
  @ValidatePathParam('clientId', { type: 'number' })
  async findClientById(ctx: Context) {
    const client = await getRepository(Client).findOne(ctx.request.params.clientId);

    if (!client) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(client);
  }

  @Post()
  @ApiOperationId('createClient')
  @ApiOperationSummary('Create a new client.')
  @ApiResponse(400, { description: 'Invalid client.' })
  @ApiResponse(201, { description: 'Client successfully created. Returns the client.' })
  @ValidateBody(clientSchema)
  async createClient(ctx: Context) {
    const client = await getRepository(Client).save(ctx.request.body);
    return new HttpResponseCreated(client);
  }

  @Patch('/:clientId')
  @ApiOperationId('modifyClient')
  @ApiOperationSummary('Update/modify an existing client.')
  @ApiResponse(400, { description: 'Invalid client.' })
  @ApiResponse(404, { description: 'Client not found.' })
  @ApiResponse(200, { description: 'Client successfully updated. Returns the client.' })
  @ValidatePathParam('clientId', { type: 'number' })
  @ValidateBody({ ...clientSchema, required: [] })
  async modifyClient(ctx: Context) {
    const client = await getRepository(Client).findOne(ctx.request.params.clientId);

    if (!client) {
      return new HttpResponseNotFound();
    }

    Object.assign(client, ctx.request.body);

    await getRepository(Client).save(client);

    return new HttpResponseOK(client);
  }

  @Put('/:clientId')
  @ApiOperationId('replaceClient')
  @ApiOperationSummary('Update/replace an existing client.')
  @ApiResponse(400, { description: 'Invalid client.' })
  @ApiResponse(404, { description: 'Client not found.' })
  @ApiResponse(200, { description: 'Client successfully updated. Returns the client.' })
  @ValidatePathParam('clientId', { type: 'number' })
  @ValidateBody(clientSchema)
  async replaceClient(ctx: Context) {
    const client = await getRepository(Client).findOne(ctx.request.params.clientId);

    if (!client) {
      return new HttpResponseNotFound();
    }

    Object.assign(client, ctx.request.body);

    await getRepository(Client).save(client);

    return new HttpResponseOK(client);
  }

  @Delete('/:clientId')
  @ApiOperationId('deleteClient')
  @ApiOperationSummary('Delete a client.')
  @ApiResponse(404, { description: 'Client not found.' })
  @ApiResponse(204, { description: 'Client successfully deleted.' })
  @ValidatePathParam('clientId', { type: 'number' })
  async deleteClient(ctx: Context) {
    const client = await getRepository(Client).findOne(ctx.request.params.clientId);

    if (!client) {
      return new HttpResponseNotFound();
    }

    await getRepository(Client).delete(ctx.request.params.clientId);

    return new HttpResponseNoContent();
  }

}
