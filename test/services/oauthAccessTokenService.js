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
var OauthAccessTokenService = require('../../services/oauthAccessTokenService');
var models = require('../../models');

describe('OauthAccessTokenService', function() {
  describe('getAccessToken', function() {
    var accessToken = 'test_access_token';
    var accessTokenNoClient = 'test_access_token_no_client';
    var accessTokenNoUser = 'test_access_token_no_user';
    var accessTokenExpires = new Date();
    var testClient = {
      client_id: 'test_client_id',
      client_secret: 'test_client_secret',
      redirect_uri: 'test_redirect_uri'
    };
    var testClientUserNotFound = {
      client_id: 'test_client_user_not_found',
      client_secret: 'test_client_secret_user_not_found',
      redirect_uri: 'test_redirect_uri_user_not_found'
    };
    var testUser = {
      testUsername: 'test_username',
      password_raw: 'test_password'
    };

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        models.sequelize.transaction(function(t) {
          return models.OauthAccessToken.create({
            access_token: accessToken,
            expires: accessTokenExpires,
            OauthClient: testClient,
            User: testUser
          }, {
            transaction: t,
            include: [
              {model: models.User, required: true},
              {model: models.OauthClient, required: true}
            ]
          }).then(function() {
            return models.OauthAccessToken.create({
              access_token: accessTokenNoClient,
              expires: accessTokenExpires,
              User: testUser
            }, {
              transaction: t,
              include: [
                {model: models.User, required: true}
              ]
            });
          }).then(function() {
            return models.OauthAccessToken.create({
              access_token: accessTokenNoUser,
              expires: accessTokenExpires,
              OauthClient: testClientUserNotFound
            }, {
              transaction: t,
              include: [
                {model: models.OauthClient, required: true}
              ]
            });
          });
        }).then(function() {
          done();
        });
      });
    });

    it('should return an access token', function(done) {
      OauthAccessTokenService.getAccessToken(accessToken).then(function(token) {
        try {
          expect(token).not.to.be(undefined);
          expect(token.access_token).to.be(accessToken);
          expect(token.expires).to.eql(accessTokenExpires);
          expect(token.fk_user_id).to.be.above(0);
          expect(token.fk_client_id).to.be(testClient.client_id);
        } catch (error) {
          done(error);
        }
        done();
      }).catch(function(error) {
        done(error);
      });
    });

    it('should throw an error for access token not found)', function(done) {
      OauthAccessTokenService.getAccessToken('missing_token').catch(function(error) {
        try {
          expect(error).to.be.a(OauthAccessTokenService.OauthAccessTokenNotFound);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should throw an error for token\'s client not found', function(done) {
      OauthAccessTokenService.getAccessToken(accessTokenNoClient).catch(function(error) {
        try {
          expect(error).to.be.a(OauthAccessTokenService.OauthAccessTokenNotFound);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should throw an error for token\'s user not found', function(done) {
      OauthAccessTokenService.getAccessToken(accessTokenNoUser).catch(function(error) {
        try {
          expect(error).to.be.a(OauthAccessTokenService.OauthAccessTokenNotFound);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
