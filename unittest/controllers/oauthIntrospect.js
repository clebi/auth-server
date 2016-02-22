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
      var req = {
        body: {}
      };
      var res = {
        status: sandbox.stub(),
        json: sandbox.spy()
      };
      res.status.returns(res);
      controller.introspectPost(req, res, spyNext);
      expect(res.status.calledWith(400)).to.be.ok();
      expect(res.json.calledWith()).to.be.ok({code: 400, message: 'missing token'});
      expect(spyNext.called).not.to.be.ok();
    });

    it('should send a json response for valid access token', function() {
      var token = 'test_token';
      var req = {
        body: {
          token: token
        }
      };
      var res = {
        status: sandbox.stub(),
        json: sandbox.spy()
      };
      var accessToken = {
        access_token: token,
        expires: new Date(),
        getUser: function() {
          return {
            user_id: 42,
            username: testUsername,
            password: 'test_password'
          };
        },
        getOauthClient: function() {
          return {
            client_id: testClientId,
            client_secret: 'test_client_secret',
            redirect_uri: 'test_redirect_uri'
          };
        }
      };
      res.status.returns(res);
      stubGetAccessToken.returns(Promise.resolve(accessToken));
      controller.introspectPost(req, res, spyNext).then(function() {
        expect(res.status.calledWith(200)).to.be.ok();
        expect(res.json.calledWith({
          active: false,
          client_id: testClientId,
          username: testUsername,
          token_type: 'access_token'
        })).to.be.ok();
        expect(spyNext.called).not.to.be.ok();
      });
    });

    it('should send a json response for invalid access token', function() {
      var token = 'test_token';
      var req = {
        body: {
          token: token
        }
      };
      var res = {
        status: sandbox.stub(),
        json: sandbox.spy()
      };
      res.status.returns(res);
      stubGetAccessToken.returns(Promise.reject(
        new OauthAccessTokenService.OauthAccessTokenNotFound('unable to find token')));
      controller.introspectPost(req, res, spyNext).then(function() {
        expect(res.status.calledWith(401)).to.be.ok();
        expect(res.json.calledWith({code: 400, message: 'invalid token'})).to.be.ok();
        expect(spyNext.called).not.to.be.ok();
      });
    });
  });
});
