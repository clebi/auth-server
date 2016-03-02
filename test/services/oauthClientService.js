/*
Copyright 2016 Clément Bizeau

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/* eslint max-nested-callbacks: [2, 6] */

var expect = require('expect.js');
var oauthClientService = require('../../services/oauthClientService');
var models = require('../../models');

describe('oauthClientService', function() {
  describe('getClient', function() {
    var clientId = 'test_client_id';
    var clientSecret = 'test_client_secret';
    var redirectUri = 'test_client_uri';

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        models.sequelize.transaction(function(t) {
          return models.OauthClient.create({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri
          }, {transaction: t});
        }).then(function() {
          done();
        }).catch(function(error) {
          done(error);
        });
      });
    });

    it('should return a client', function(done) {
      oauthClientService.getClient(clientId).then(function(client) {
        try {
          expect(client).not.to.be(undefined);
          expect(client.client_id).to.be(clientId);
          expect(client.client_secret).to.be(clientSecret);
          expect(client.redirect_uri).to.be(redirectUri);
          done();
        } catch (error) {
          done(error);
        }
      }).catch(function(error) {
        done(error);
      });
    });

    it('should throw an error for client not found (missing username)', function(done) {
      oauthClientService.getClient('missing_client').catch(function(error) {
        try {
          expect(error).to.be.a(oauthClientService.ClientNotFound);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
