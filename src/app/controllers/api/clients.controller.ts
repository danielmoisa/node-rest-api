import { ApiUseTag, Context, Delete, Get, HttpResponseCreated, HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Post, UserRequired, ValidateBody, ValidatePathParam, ValidateQueryParam } from '@foal/core';
import { Client, User } from '../../entities';

@ApiUseTag('client')
export class ClientsController {

  @Get()
  @ValidateQueryParam('userId', { type: 'number' }, { required: false })
  async getClients(ctx: Context) {
    const userId = ctx.request.query.userId as number | undefined;

    let queryBuilder = Client
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.user', 'user')
      .select([
        'client.id',
        'client.firstName',
        'client.lastName',
        'client.website',
        'user.id',
      ]);

    if (userId !== undefined) {
      queryBuilder = queryBuilder.where('user.id = :userId', { userId });
    }

    const clients = await queryBuilder.getMany();

    return new HttpResponseOK(clients);
  }


  @Post()
  @ValidateBody({
    type: 'object',
    properties: {
      firstName: { type: 'string', maxLength: 255 },
      lastname: { type: 'string', maxLength: 255 },
      website: { type: 'string', maxLength: 255 },
    },
    required: ['firstName', 'lastName', 'website'],
    additionalProperties: false,
  })
  @UserRequired()
  async createClient(ctx: Context) {
    const client = new Client();
    client.firstName = ctx.request.body.firstName;
    client.lastName = ctx.request.body.lastName;
    client.website = ctx.request.body.website;
    // Set the current user as the user of the client.
    client.user = ctx.user;
    await client.save();

    return new HttpResponseCreated();
  }

  @Delete('/:clientId')
  @ValidatePathParam('clientId', { type: 'number' })
  @UserRequired()
  async deleteClient(ctx: Context<User>, { clientId }: { clientId: number }) {
    // Only retrieve clients of the current user.
    const client = await Client.findOne({ id: clientId, user: ctx.user });

    if (!client) {
      return new HttpResponseNotFound();
    }

    await client.remove();

    return new HttpResponseNoContent();
  }
}
