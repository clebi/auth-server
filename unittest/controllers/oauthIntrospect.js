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

var sinon = require('sinon');
var OauthAccessTokenService = require('../../services/oauthAccessTokenService');
var controller = require('../../controllers/oauth');
var expect = require('expect.js');
var Promise = require('bluebird');
var moment = require('moment');

/**
 * create an access token for testing purpose
 * @method createAccessToken
 * @param  {string} token    access token string
 * @param  {Date} expires  token expiration time
 * @param  {string} username username
 * @param  {string} clientId id of the client
 * @return {object} a new access token object
 */
function createAccessToken(token, expires, username, clientId) {
  return {
    access_token: token,
    expires: expires,
    getUser: function() {
      return {
        user_id: 42,
        username: username,
        password: 'test_password'
      };
    },
    getOauthClient: function() {
      return {
        client_id: clientId,
        client_secret: 'test_client_secret',
        redirect_uri: 'test_redirect_uri'
      };
    }
  };
}

/**
 * create a new request for testing prupose
 * @method createRequest
 * @param  {string} token access token that will be in the request
 * @return {object} a new request
 */
function createRequest(token) {
  return {
    body: {
      token: token
    }
  };
}

/**
 * create a response object for testing purpose
 * @method createResponse
 * @param  {sinon.sandbox} sandbox sandbox for test doubles
 * @return {object} new response object with test doubles
 */
function createResponse(sandbox) {
  var res = {
    status: sandbox.stub(),
    json: sandbox.spy()
  };
  res.status.returns(res);
  return res;
}

describe('controllers', function() {
  var sandbox;
  var spyNext;
  var stubGetAccessToken;
  var testClientId = 'test_client_id';
  var testUsername = 'test_username';

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    stubGetAccessToken = sandbox.stub(OauthAccessTokenService, 'getAccessToken');
    spyNext = sandbox.spy();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('introspect', function() {
    it('should send a http code 400 for missing token', function() {
      var req = createRequest(null);
      var res = createResponse(sandbox);
      controller.introspectPost(req, res, spyNext);
      expect(res.status.calledWith(400)).to.be.ok();
      expect(res.json.calledWith()).to.be.ok({code: 400, message: 'missing token'});
      expect(spyNext.called).not.to.be.ok();
    });

    it('should send a valid json response for inactive token', function() {
      var token = 'test_token';
      var req = createRequest(token);
      var res = createResponse(sandbox);
      var expires = new Date();
      var accessToken = createAccessToken(token, expires, testUsername, testClientId);
      stubGetAccessToken.returns(Promise.resolve(accessToken));
      controller.introspectPost(req, res, spyNext).then(function() {
        expect(res.status.calledWith(200)).to.be.ok();
        expect(res.json.calledWith({
          active: false,
          client_id: testClientId,
          username: testUsername,
          token_type: 'access_token',
          exp: moment(expires).unix()
        })).to.be.ok();
        expect(spyNext.called).not.to.be.ok();
      });
    });

    it('should send a valid json response for active token', function() {
      var token = 'test_token';
      var req = createRequest(token);
      var res = createResponse(sandbox);
      var expires = moment().add(1, 'days');
      var accessToken = createAccessToken(token, expires.toDate(), testUsername, testClientId);
      stubGetAccessToken.returns(Promise.resolve(accessToken));
      controller.introspectPost(req, res, spyNext).then(function() {
        expect(res.status.calledWith(200)).to.be.ok();
        expect(res.json.calledWith({
          active: true,
          client_id: testClientId,
          username: testUsername,
          token_type: 'access_token',
          exp: expires.unix()
        })).to.be.ok();
      });
    });

    it('should send a json response for invalid access token with http code 401', function() {
      var token = 'test_token';
      var req = createRequest(token);
      var res = createResponse(sandbox);
      stubGetAccessToken.returns(Promise.reject(
        new OauthAccessTokenService.OauthAccessTokenNotFound('unable to find token')));
      controller.introspectPost(req, res, spyNext).then(function() {
        expect(res.status.calledWith(401)).to.be.ok();
        expect(res.json.calledWith({code: 400, message: 'invalid token'})).to.be.ok();
        expect(spyNext.called).not.to.be.ok();
      });
    });

    it('should call next with error', function() {
      var token = 'test_token';
      var req = createRequest(token);
      var res = createResponse(sandbox);
      var error = new Error('random error');
      stubGetAccessToken.returns(Promise.reject(error));
      controller.introspectPost(req, res, spyNext).then(function() {
        expect(spyNext.calledWith(error)).to.be.ok();
      });
    });
  });
});
