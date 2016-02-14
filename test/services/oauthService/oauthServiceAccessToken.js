/* eslint max-nested-callbacks: [2, 6] */

var assert = require('assert');
var expect = require('expect.js');
var oauthService = require('../../../services/oauthService');
var models = require('../../../models');
var Promise = require('bluebird');
var bcrypt = require('bcrypt');

describe('OauthServiceAccessToken', function() {
  describe('getAccessToken', function() {
    var userId = 1;
    var username = 'test_username';
    var password = 'test_password';

    var accessToken = 'test_token';
    var now = new Date();

    var errorTokenNotFound = new Error('token not found');

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        return models.sequelize.transaction(function(t) {
          return Promise.join(
            models.User.create({
              user_id: userId,
              username: username,
              password_raw: password
            }, {transaction: t}),
            models.OauthAccessToken.create({
              access_token: accessToken,
              expires: now
            }, {transaction: t})
         ).spread(function(user, token) {
           return user.addOauthAccessToken(token, {transaction: t});
         });
        }).then(function() {
          done();
        }).catch(function() {
        });
      });
    });

    it('should return user', function(done) {
      oauthService.getAccessToken('test_token', function(error, data) {
        assert.ifError(error);
        assert.deepEqual(now, data.expires);
        assert.equal(userId, data.user.user_id);
        assert.equal(username, data.user.username);
        expect(bcrypt.compareSync(password, data.user.password)).to.be.ok();
        done();
      });
    });

    it('should return an error (token not found)', function(done) {
      oauthService.getAccessToken('missing_token', function(error) {
        assert.deepEqual(errorTokenNotFound, error);
        done();
      });
    });
  });

  describe('saveAccessToken', function() {
    var clientId = 'test_client_id';
    var clientSecret = 'test_clientSecret';
    var redirectUri = 'test_uri';

    var userId = 42;
    var username = 'test_username';
    var password = 'test_password';

    var testToken = 'test_access_token';
    var tokenExpires = new Date();

    var errorClientNotFound = Error('unable to find client with id: ' + clientId);
    var errorUserNotFound = new Error('unable to find user with id: ' + userId);

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        return models.sequelize.transaction(function(t) {
          return models.OauthClient.create({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri
          }, {transaction: t}).then(function() {
            return models.User.create({
              user_id: userId,
              username: username,
              password_raw: password
            });
          });
        }).then(function() {
          done();
        }).catch(function() {
        });
      });
    });

    it('should save a token', function(done) {
      oauthService.saveAccessToken(testToken, clientId, tokenExpires, {id: userId}, function(error) {
        assert.ifError(error);
        models.sequelize.transaction(function(t) {
          return models.OauthAccessToken.findOne({
            where: {
              access_token: testToken
            }
          }, {transaction: t});
        }).then(function(token) {
          assert.equal(testToken, token.access_token);
          assert.deepEqual(tokenExpires, token.expires);
          done();
        });
      });
    });

    it('should throw an error for missing client', function(done) {
      oauthService.saveAccessToken(testToken, 'missing_client_id', tokenExpires, {id: userId}, function(error) {
        assert.deepEqual(errorClientNotFound, error);
        done();
      });
    });

    it('should throw an error for missing user', function(done) {
      oauthService.saveAccessToken(testToken, clientId, tokenExpires, {id: 12}, function(error) {
        assert.deepEqual(errorUserNotFound, error);
        done();
      });
    });
  });
});
