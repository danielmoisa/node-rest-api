import {
  ApiOperationDescription, ApiOperationId, ApiOperationSummary, ApiResponse,
  ApiUseTag, Context, Delete, Get, HttpResponseCreated,
  HttpResponseNoContent, HttpResponseNotFound, HttpResponseOK, Patch, Post,
  Put, ValidateBody, ValidatePathParam, ValidateQueryParam
} from '@foal/core';
import { getRepository } from 'typeorm';

import { Campaign } from '../../entities';

const campaignSchema = {
  additionalProperties: false,
  properties: {
    text: { type: 'string', maxLength: 255 },
  },
  required: [ 'text' ],
  type: 'object',
};

@ApiUseTag('campaign')
export class CampaignController {

  @Get()
  @ApiOperationId('findCampaigns')
  @ApiOperationSummary('Find campaigns.')
  @ApiOperationDescription(
    'The query parameters "skip" and "take" can be used for pagination. The first ' +
    'is the offset and the second is the number of elements to be returned.'
  )
  @ApiResponse(400, { description: 'Invalid query parameters.' })
  @ApiResponse(200, { description: 'Returns a list of campaigns.' })
  @ValidateQueryParam('skip', { type: 'number' }, { required: false })
  @ValidateQueryParam('take', { type: 'number' }, { required: false })
  async findCampaigns(ctx: Context) {
    const campaigns = await getRepository(Campaign).find({
      skip: ctx.request.query.skip,
      take: ctx.request.query.take,
      where: {},
    });
    return new HttpResponseOK(campaigns);
  }

  @Get('/:campaignId')
  @ApiOperationId('findCampaignById')
  @ApiOperationSummary('Find a campaign by ID.')
  @ApiResponse(404, { description: 'Campaign not found.' })
  @ApiResponse(200, { description: 'Returns the campaign.' })
  @ValidatePathParam('campaignId', { type: 'number' })
  async findCampaignById(ctx: Context) {
    const campaign = await getRepository(Campaign).findOne(ctx.request.params.campaignId);

    if (!campaign) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(campaign);
  }

  @Post()
  @ApiOperationId('createCampaign')
  @ApiOperationSummary('Create a new campaign.')
  @ApiResponse(400, { description: 'Invalid campaign.' })
  @ApiResponse(201, { description: 'Campaign successfully created. Returns the campaign.' })
  @ValidateBody(campaignSchema)
  async createCampaign(ctx: Context) {
    const campaign = await getRepository(Campaign).save(ctx.request.body);
    return new HttpResponseCreated(campaign);
  }

  @Patch('/:campaignId')
  @ApiOperationId('modifyCampaign')
  @ApiOperationSummary('Update/modify an existing campaign.')
  @ApiResponse(400, { description: 'Invalid campaign.' })
  @ApiResponse(404, { description: 'Campaign not found.' })
  @ApiResponse(200, { description: 'Campaign successfully updated. Returns the campaign.' })
  @ValidatePathParam('campaignId', { type: 'number' })
  @ValidateBody({ ...campaignSchema, required: [] })
  async modifyCampaign(ctx: Context) {
    const campaign = await getRepository(Campaign).findOne(ctx.request.params.campaignId);

    if (!campaign) {
      return new HttpResponseNotFound();
    }

    Object.assign(campaign, ctx.request.body);

    await getRepository(Campaign).save(campaign);

    return new HttpResponseOK(campaign);
  }

  @Put('/:campaignId')
  @ApiOperationId('replaceCampaign')
  @ApiOperationSummary('Update/replace an existing campaign.')
  @ApiResponse(400, { description: 'Invalid campaign.' })
  @ApiResponse(404, { description: 'Campaign not found.' })
  @ApiResponse(200, { description: 'Campaign successfully updated. Returns the campaign.' })
  @ValidatePathParam('campaignId', { type: 'number' })
  @ValidateBody(campaignSchema)
  async replaceCampaign(ctx: Context) {
    const campaign = await getRepository(Campaign).findOne(ctx.request.params.campaignId);

    if (!campaign) {
      return new HttpResponseNotFound();
    }

    Object.assign(campaign, ctx.request.body);

    await getRepository(Campaign).save(campaign);

    return new HttpResponseOK(campaign);
  }

  @Delete('/:campaignId')
  @ApiOperationId('deleteCampaign')
  @ApiOperationSummary('Delete a campaign.')
  @ApiResponse(404, { description: 'Campaign not found.' })
  @ApiResponse(204, { description: 'Campaign successfully deleted.' })
  @ValidatePathParam('campaignId', { type: 'number' })
  async deleteCampaign(ctx: Context) {
    const campaign = await getRepository(Campaign).findOne(ctx.request.params.campaignId);

    if (!campaign) {
      return new HttpResponseNotFound();
    }

    await getRepository(Campaign).delete(ctx.request.params.campaignId);

    return new HttpResponseNoContent();
  }

}
