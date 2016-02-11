/* eslint max-nested-callbacks: [2, 6] */

var assert = require('assert');
var oauthService = require('../../../services/oauthService');
var models = require('../../../models');
var Promise = require('bluebird');

describe('OauthServiceAuthcode', function() {
  describe('AuthCode', function() {
    var clientId = 'test_auth_code_client_id';
    var clientSecret = 'test_auth_code_client_secret';
    var redirectUri = 'test_auth_code_redirect_uri';

    var userId = 42;
    var username = 'test_auth_code_username';
    var password = 'test_auth_code_user_password';

    var authCode = 'test_auth_code';
    var authCodeExpires = new Date();

    var errorAuthCodeNotFound = new Error('missing auth code with id: ' + authCode);

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        models.sequelize.transaction(function(t) {
          return models.OauthCode.create({
            code: authCode,
            expires: authCodeExpires,
            OauthClient: {
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri
            },
            User: {
              user_id: userId,
              username: username,
              password: password
            }
          }, {
            include: [models.OauthClient, models.User],
            transaction: t
          });
        }).then(function() {
          done();
        }).catch(function() {
        });
      });
    });

    it('should return an auth code', function(done) {
      oauthService.getAuthCode(authCode, function(error, authCode) {
        assert.ifError(error);
        assert.equal(clientId, authCode.clientId);
        assert.deepEqual(authCodeExpires, authCode.expires);
        assert.equal(userId, authCode.userId);
        done();
      });
    });

    it('should throw an error for missing oauth code', function(done) {
      oauthService.getAuthCode('missing_auth_code', function(error) {
        assert.deepEqual(errorAuthCodeNotFound, error);
        done();
      });
    });
  });
});
