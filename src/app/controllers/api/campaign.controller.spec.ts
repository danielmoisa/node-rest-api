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
import { Campaign } from '../../entities';
import { CampaignController } from './campaign.controller';

describe('CampaignController', () => {

  let controller: CampaignController;
  let campaign1: Campaign;
  let campaign2: Campaign;

  before(() => createConnection());

  after(() => getConnection().close());

  beforeEach(async () => {
    controller = createController(CampaignController);

    const repository = getRepository(Campaign);
    await repository.clear();
    [ campaign1, campaign2 ] = await repository.save([
      {
        text: 'Campaign 1'
      },
      {
        text: 'Campaign 2'
      },
    ]);
  });

  describe('has a "findCampaigns" method that', () => {

    it('should handle requests at GET /.', () => {
      strictEqual(getHttpMethod(CampaignController, 'findCampaigns'), 'GET');
      strictEqual(getPath(CampaignController, 'findCampaigns'), undefined);
    });

    it('should return an HttpResponseOK object with the campaign list.', async () => {
      const ctx = new Context({ query: {} });
      const response = await controller.findCampaigns(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      if (!Array.isArray(response.body)) {
        throw new Error('The response body should be an array of campaigns.');
      }

      strictEqual(response.body.length, 2);
      ok(response.body.find(campaign => campaign.text === campaign1.text));
      ok(response.body.find(campaign => campaign.text === campaign2.text));
    });

    it('should support pagination', async () => {
      const campaign3 = await getRepository(Campaign).save({
        text: 'Campaign 3',
      });

      let ctx = new Context({
        query: {
          take: 2
        }
      });
      let response = await controller.findCampaigns(ctx);

      strictEqual(response.body.length, 2);
      ok(response.body.find(campaign => campaign.id === campaign1.id));
      ok(response.body.find(campaign => campaign.id === campaign2.id));
      ok(!response.body.find(campaign => campaign.id === campaign3.id));

      ctx = new Context({
        query: {
          skip: 1
        }
      });
      response = await controller.findCampaigns(ctx);

      strictEqual(response.body.length, 2);
      ok(!response.body.find(campaign => campaign.id === campaign1.id));
      ok(response.body.find(campaign => campaign.id === campaign2.id));
      ok(response.body.find(campaign => campaign.id === campaign3.id));
    });

  });

  describe('has a "findCampaignById" method that', () => {

    it('should handle requests at GET /:campaignId.', () => {
      strictEqual(getHttpMethod(CampaignController, 'findCampaignById'), 'GET');
      strictEqual(getPath(CampaignController, 'findCampaignById'), '/:campaignId');
    });

    it('should return an HttpResponseOK object if the campaign was found.', async () => {
      const ctx = new Context({
        params: {
          campaignId: campaign2.id
        }
      });
      const response = await controller.findCampaignById(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      strictEqual(response.body.id, campaign2.id);
      strictEqual(response.body.text, campaign2.text);
    });

    it('should return an HttpResponseNotFound object if the campaign was not found.', async () => {
      const ctx = new Context({
        params: {
          campaignId: -1
        }
      });
      const response = await controller.findCampaignById(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "createCampaign" method that', () => {

    it('should handle requests at POST /.', () => {
      strictEqual(getHttpMethod(CampaignController, 'createCampaign'), 'POST');
      strictEqual(getPath(CampaignController, 'createCampaign'), undefined);
    });

    it('should create the campaign in the database and return it through '
        + 'an HttpResponseCreated object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Campaign 3',
        }
      });
      const response = await controller.createCampaign(ctx);

      if (!isHttpResponseCreated(response)) {
        throw new Error('The returned value should be an HttpResponseCreated object.');
      }

      const campaign = await getRepository(Campaign).findOne({ text: 'Campaign 3' });

      if (!campaign) {
        throw new Error('No campaign 3 was found in the database.');
      }

      strictEqual(campaign.text, 'Campaign 3');

      strictEqual(response.body.id, campaign.id);
      strictEqual(response.body.text, campaign.text);
    });

  });

  describe('has a "modifyCampaign" method that', () => {

    it('should handle requests at PATCH /:campaignId.', () => {
      strictEqual(getHttpMethod(CampaignController, 'modifyCampaign'), 'PATCH');
      strictEqual(getPath(CampaignController, 'modifyCampaign'), '/:campaignId');
    });

    it('should update the campaign in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Campaign 2 (version 2)',
        },
        params: {
          campaignId: campaign2.id
        }
      });
      const response = await controller.modifyCampaign(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const campaign = await getRepository(Campaign).findOne(campaign2.id);

      if (!campaign) {
        throw new Error();
      }

      strictEqual(campaign.text, 'Campaign 2 (version 2)');

      strictEqual(response.body.id, campaign.id);
      strictEqual(response.body.text, campaign.text);
    });

    it('should not update the other campaigns.', async () => {
      const ctx = new Context({
        body: {
          text: 'Campaign 2 (version 2)',
        },
        params: {
          campaignId: campaign2.id
        }
      });
      await controller.modifyCampaign(ctx);

      const campaign = await getRepository(Campaign).findOne(campaign1.id);

      if (!campaign) {
        throw new Error();
      }

      notStrictEqual(campaign.text, 'Campaign 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          campaignId: -1
        }
      });
      const response = await controller.modifyCampaign(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "replaceCampaign" method that', () => {

    it('should handle requests at PUT /:campaignId.', () => {
      strictEqual(getHttpMethod(CampaignController, 'replaceCampaign'), 'PUT');
      strictEqual(getPath(CampaignController, 'replaceCampaign'), '/:campaignId');
    });

    it('should update the campaign in the database and return it through an HttpResponseOK object.', async () => {
      const ctx = new Context({
        body: {
          text: 'Campaign 2 (version 2)',
        },
        params: {
          campaignId: campaign2.id
        }
      });
      const response = await controller.replaceCampaign(ctx);

      if (!isHttpResponseOK(response)) {
        throw new Error('The returned value should be an HttpResponseOK object.');
      }

      const campaign = await getRepository(Campaign).findOne(campaign2.id);

      if (!campaign) {
        throw new Error();
      }

      strictEqual(campaign.text, 'Campaign 2 (version 2)');

      strictEqual(response.body.id, campaign.id);
      strictEqual(response.body.text, campaign.text);
    });

    it('should not update the other campaigns.', async () => {
      const ctx = new Context({
        body: {
          text: 'Campaign 2 (version 2)',
        },
        params: {
          campaignId: campaign2.id
        }
      });
      await controller.replaceCampaign(ctx);

      const campaign = await getRepository(Campaign).findOne(campaign1.id);

      if (!campaign) {
        throw new Error();
      }

      notStrictEqual(campaign.text, 'Campaign 2 (version 2)');
    });

    it('should return an HttpResponseNotFound if the object does not exist.', async () => {
      const ctx = new Context({
        body: {
          text: '',
        },
        params: {
          campaignId: -1
        }
      });
      const response = await controller.replaceCampaign(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

  describe('has a "deleteCampaign" method that', () => {

    it('should handle requests at DELETE /:campaignId.', () => {
      strictEqual(getHttpMethod(CampaignController, 'deleteCampaign'), 'DELETE');
      strictEqual(getPath(CampaignController, 'deleteCampaign'), '/:campaignId');
    });

    it('should delete the campaign and return an HttpResponseNoContent object.', async () => {
      const ctx = new Context({
        params: {
          campaignId: campaign2.id
        }
      });
      const response = await controller.deleteCampaign(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const campaign = await getRepository(Campaign).findOne(campaign2.id);

      strictEqual(campaign, undefined);
    });

    it('should not delete the other campaigns.', async () => {
      const ctx = new Context({
        params: {
          campaignId: campaign2.id
        }
      });
      const response = await controller.deleteCampaign(ctx);

      if (!isHttpResponseNoContent(response)) {
        throw new Error('The returned value should be an HttpResponseNoContent object.');
      }

      const campaign = await getRepository(Campaign).findOne(campaign1.id);

      notStrictEqual(campaign, undefined);
    });

    it('should return an HttpResponseNotFound if the campaign was not found.', async () => {
      const ctx = new Context({
        params: {
          campaignId: -1
        }
      });
      const response = await controller.deleteCampaign(ctx);

      if (!isHttpResponseNotFound(response)) {
        throw new Error('The returned value should be an HttpResponseNotFound object.');
      }
    });

  });

});
