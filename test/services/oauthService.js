var assert = require('assert');
var oauthService = require('../../services/oauthService');
var models = require('../../models');

describe('OauthService', function() {

  describe('getAccessToken', function() {

    var userId = 1;
    var username = 'test_username';
    var password = 'test_password';

    var accessToken = 'test_token';
    var now = new Date();

    var error_token_not_found = new Error('token not found');

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        return models.sequelize.transaction();
      }).then(function(t) {
        return models.User.create({
          user_id: userId,
          username: username,
          password: password
        }, {transaction: t}).then(function(user) {
          return models.OauthAccessToken.create({
            access_token: accessToken,
            expires: now
          }, {transaction: t}).then(function(token) {
            user.addOauthAccessToken(token, {transaction: t});
          });
        }).then(function() {
          t.commit();
          done();
        }).catch(function() {
          t.rollback();
        });
      });
    });

    it('should return user', function(done) {
      oauthService.getAccessToken('test_token', function(error, data) {
        assert.ok(!error);
        assert.deepEqual(now, data.expires);
        assert.equal(userId, data.user.user_id);
        assert.equal(username, data.user.username);
        assert.equal(password, data.user.password);
        done();
      });
    });

    it('should return an error (token not found)', function(done) {
      oauthService.getAccessToken('missing_token', function(error, data)  {
        assert.ok(error);
        assert.deepEqual(error_token_not_found, error);
        done();
      });
    });
  });

  describe('saveAccessToken', function() {

    var client_id = 'test_client_id';
    var client_secret = 'test_client_secret';
    var client_uri = 'test_uri';

    var user_id = 42;
    var username =  'test_username';
    var password = 'test_password';

    var test_token = 'test_access_token';
    var token_expires = new Date();

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        return models.sequelize.transaction();
      }).then(function(t) {
        return models.OauthClient.create({
          client_id: client_id,
          client_secret: client_secret,
          redirect_uri: client_uri
        }, {transaction: t}).then(function(client) {
          return models.User.create({
            user_id: user_id,
            username: username,
            password: password
          });
        }).then(function() {
          t.commit();
          done();
        }).catch(function(error) {
          t.rollback();
        });
      });
    });

    it('should save a token', function(done) {
      oauthService.saveAccessToken(test_token, client_id, token_expires, {id: user_id}, function(error) {
        assert.ok(!error);
        models.sequelize.transaction(function(t) {
          return models.OauthAccessToken.findOne({
            where: {
              access_token: test_token
            }
          }, {transaction: t});
        }).then(function(token) {
          assert.equal(test_token, token.access_token);
          assert.deepEqual(token_expires, token.expires);
          done();
        });
      });
    });
  });
});
