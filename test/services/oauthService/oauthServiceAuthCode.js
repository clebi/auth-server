/* eslint max-nested-callbacks: [2, 6] */

var expect = require('expect.js');
var oauthService = require('../../../services/oauthService');
var models = require('../../../models');
var Promise = require('bluebird');

describe('OauthServiceAuthcode', function() {
  describe('getAuthCode', function() {
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
        expect(error).not.to.be.a(Error);
        expect(authCode.clientId).to.be(clientId);
        expect(authCode.expires).to.eql(authCodeExpires);
        expect(authCode.userId).to.be(userId);
        done();
      });
    });

    it('should throw an error for missing oauth code', function(done) {
      oauthService.getAuthCode('missing_auth_code', function(error) {
        expect(error).to.eql(errorAuthCodeNotFound);
        done();
      });
    });
  });

  describe('saveAuthCode', function() {
    var clientId = 'test_save_auth_code_client_id';
    var clientSecret = 'test_save_auth_code_client_secret';
    var redirectUri = 'test_save_auth_code_redirect_uri';

    var userId = 36;
    var username = 'test_save_auth_code_username';
    var password = 'test_save_auth_code_password';

    var authCode = 'test_auth_code';
    var authCodeExpires = new Date();

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        models.sequelize.transaction(function(t) {
          return Promise.join(
            models.OauthClient.create({
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri
            }, {transaction: t}),
            models.User.create({
              user_id: userId,
              username: username,
              password: password
            }, {transaction: t})
          );
        }).then(function() {
          done();
        });
      });
    });

    it('should save an auth code', function(done) {
      oauthService.saveAuthCode(authCode, clientId, authCodeExpires, userId, function(error) {
        expect(error).not.to.be.a(Error);
        done();
      });
    });

    it('should throw an error for missing oauth client', function(done) {
      var clientIdNotFound = 'missing_client_id';
      oauthService.saveAuthCode(authCode, clientIdNotFound, authCodeExpires, userId, function(error) {
        expect(error).to.eql(new Error('client not found with id: ' + clientIdNotFound));
        done();
      });
    });

    it('should throw an error for missing user', function(done) {
      var userIdNotFound = 66;
      oauthService.saveAuthCode(authCode, clientId, authCodeExpires, userIdNotFound, function(error) {
        expect(error).to.eql(new Error('user not found with id: ' + userIdNotFound));
        done();
      });
    });
  });
});
