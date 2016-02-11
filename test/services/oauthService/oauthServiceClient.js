/* eslint max-nested-callbacks: [2, 5] */

var assert = require('assert');
var oauthService = require('../../services/oauthService');
var models = require('../../models');

describe('OauthService', function() {
  describe('getClient', function() {
    var clientId = 'test_getclient_id';
    var clientSecret = 'test_getclient_secret';
    var redirectUri = 'test_getclient_redirect_uri';

    var errorMissingClient = new Error('client not found');
    var errorSecrectsDoesntMatch = new Error('secrets doesn\'t match');

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        return models.sequelize.transaction();
      }).then(function(t) {
        return models.OauthClient.create({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri
        }, {transaction: t}).then(function() {
          t.commit();
          done();
        }).catch(function() {
          t.rollback();
        });
      });
    });

    it('should return a client', function(done) {
      oauthService.getClient(clientId, clientSecret, function(error, client) {
        assert.equal(null, error);
        assert.equal(clientId, client.clientId);
        assert.equal(clientSecret, client.clientSecret);
        assert.equal(redirectUri, client.redirectUri);
        done();
      });
    });

    it('should throw an error for missing client', function(done) {
      oauthService.getClient('missing client', 'secret', function(error) {
        assert.deepEqual(errorMissingClient, error);
        done();
      });
    });

    it('should throw an error for bad client secret', function(done) {
      oauthService.getClient(clientId, 'bad_secret', function(error) {
        assert.deepEqual(errorSecrectsDoesntMatch, error);
        done();
      });
    });
  });
});
