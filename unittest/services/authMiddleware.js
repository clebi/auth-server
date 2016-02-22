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
var auth = require('../../middelwares/authMiddleware');
var oauthClientService = require('../../services/oauthClientService');
var expect = require('expect.js');

/**
 * build a request object with an authorization header
 * @param {string} clientName name of the client
 * @param {string} clientPass password of the client
 * @return {object} a request with authorization header
 */
function buildRequest(clientName, clientPass) {
  return {
    headers: {
      authorization: 'Basic ' + new Buffer(clientName + ':' + clientPass).toString('base64')
    }
  };
}

/**
 * check bad auth response from middleware
 * @param {sinon.stub} stubStatus a stub for response status setter
 * @param {sinon.spy} spyJson a stub for response json function
 * @param {function} done callback to signal end of the test
 */
function checkBadAuthResponse(stubStatus, spyJson, done) {
  try {
    expect(stubStatus.calledWith(401)).to.be.ok();
    expect(spyJson.calledWith({code: 401, message: 'bad credentials'}));
    done();
  } catch (error) {
    done(error);
  }
}

describe('auth middleware', function() {
  var sandbox;
  var stubOauthClientService;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    stubOauthClientService = sandbox.stub(oauthClientService, 'getClient');
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('basic auth', function() {
    var client = {
      client_id: 'test_basic_auth_name',
      client_secret: 'test_basic_auth_pass',
      redirect_uri: 'test_url'
    };
    var reqUserWithValidSecret = buildRequest(client.client_id, client.client_secret);

    it('should call next middleware', function(done) {
      stubOauthClientService.returns(Promise.resolve(client));
      var res = {};
      var nextSpy = sandbox.spy();
      auth.basicAuth(reqUserWithValidSecret, res, nextSpy).then(function() {
        try {
          expect(nextSpy.calledWith()).to.be.ok();
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should send a json error with code 401 for bad authorization header', function() {
      var stubStatus = sandbox.stub();
      var spyJson = sandbox.spy();
      var req = buildRequest('', '');
      var res = {
        status: stubStatus,
        json: spyJson
      };
      stubStatus.returns(res);
      auth.basicAuth(req, res).then(function(done) {
        checkBadAuthResponse(stubStatus, spyJson, done);
      });
    });

    it('should send a json error with code 401 for bad password', function(done) {
      stubOauthClientService.returns(Promise.resolve(client));
      var stubStatus = sandbox.stub();
      var spyJson = sandbox.spy();
      var req = buildRequest(client.client_id, 'bad_password');
      var res = {
        status: stubStatus,
        json: spyJson
      };
      stubStatus.returns(res);
      auth.basicAuth(req, res).then(function() {
        checkBadAuthResponse(stubStatus, spyJson, done);
      });
    });

    it('should send a json error with code 401 for client not found', function(done) {
      stubOauthClientService.returns(Promise.reject(new oauthClientService.ClientNotFound()));
      var stubStatus = sandbox.stub();
      var spyJson = sandbox.spy();
      var res = {
        status: stubStatus,
        json: spyJson
      };
      stubStatus.returns(res);
      auth.basicAuth(reqUserWithValidSecret, res).then(function() {
        checkBadAuthResponse(stubStatus, spyJson, done);
      });
    });

    it('should call next widdleware with an error', function(done) {
      var error = new Error('test_error');
      stubOauthClientService.returns(Promise.reject(error));
      var res = {};
      var nextSpy = sandbox.spy();
      auth.basicAuth(reqUserWithValidSecret, res, nextSpy).then(function() {
        try {
          expect(nextSpy.calledWith(error)).to.be.ok();
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
