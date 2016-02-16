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
var oauthService = require('../../../services/oauthService');
var models = require('../../../models');

describe('OauthServiceGrantType', function() {
  describe('getGrantTypeAllowed', function() {
    var grantType = 'test_grant_type';
    var clientId = 'test_grant_type_id';
    var clientSecret = 'test_grant_type_secret';
    var redirectUri = 'test_grant_type_redirect_uri';

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        models.sequelize.transaction(function(t) {
          return models.ClientGrantType.create({
            grant_type: grantType,
            OauthClient: {
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri
            }
          }, {
            include: [models.OauthClient],
            transaction: t
          });
        }).then(function() {
          done();
        }).catch(function() {
        });
      });
    });

    it('should return grant type', function(done) {
      oauthService.grantTypeAllowed(clientId, grantType, function(error, allowed) {
        expect(error).not.to.be.a(Error);
        expect(allowed).to.be.ok();
        done();
      });
    });

    it('should throw an error for oauth client not found', function(done) {
      var missingClientId = 'missing_client';
      oauthService.grantTypeAllowed(missingClientId, grantType, function(error, allowed) {
        expect(error).not.to.be.a(Error);
        expect(allowed).not.to.be.ok();
        done();
      });
    });

    it('should throw an error for grant type not found', function(done) {
      var missingGrantType = 'missing_grant_type';
      oauthService.grantTypeAllowed(clientId, missingGrantType, function(error, allowed) {
        expect(error).not.to.be.a(Error);
        expect(allowed).not.to.be.ok();
        done();
      });
    });
  });
});
