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
var auth = require('../../middlewares/authMiddleware');
var resourceServerService = require('../../services/resourceServerService');
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
  var stubResourceServerService;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    stubResourceServerService = sandbox.stub(resourceServerService, 'getResourceServer');
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('basic auth', function() {
    var resourceServer = {
      resource_server_id: 'test_resource_server_id',
      secret: 'test_resource_server_secret',
      enabled: true
    };
    var reqUserWithValidSecret = buildRequest(resourceServer.resource_server_id, resourceServer.secret);

    it('should call next middleware', function(done) {
      stubResourceServerService.returns(Promise.resolve(resourceServer));
      var res = {};
      var nextSpy = sandbox.spy();
      auth.basicAuth(reqUserWithValidSecret, res, nextSpy).then(function() {
        try {
          expect(nextSpy.calledWith()).to.be.ok();
          done();
        } catch (error) {
          done(error);
        }
      }).catch(function(error) {
        done(error);
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
      stubResourceServerService.returns(Promise.resolve(resourceServer));
      var stubStatus = sandbox.stub();
      var spyJson = sandbox.spy();
      var req = buildRequest(resourceServer.client_id, 'bad_password');
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
      stubResourceServerService.returns(Promise.reject(new resourceServerService.ResourceServerNotFound()));
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
      stubResourceServerService.returns(Promise.reject(error));
      var res = {};
      var nextSpy = sandbox.spy();
      auth.basicAuth(reqUserWithValidSecret, res, nextSpy).then(function() {
        try {
          expect(nextSpy.calledWith(error)).to.be.ok();
          done();
        } catch (error) {
          done(error);
        }
      }).catch(function(error) {
        done(error);
      });
    });
  });
});
