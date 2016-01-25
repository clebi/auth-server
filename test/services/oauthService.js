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
  });
});
