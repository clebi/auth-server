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
var controller = require('../../controllers/oauth');
var expect = require('expect.js');

describe('controllers', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('authorize get', function() {
    var clientId = 'test_client_id';
    var redirectUri = 'test_redirect_uri';
    var query = {
      client_id: clientId,
      redirect_uri: redirectUri
    };

    it('should render authorize page', function() {
      var req = {
        session: {
          user: {}
        },
        query: query
      };
      var spyRender = sandbox.spy();
      controller.authorizeGet(req, {render: spyRender});
      expect(spyRender.calledWith('authorize', {
        title: 'Authorize',
        client_id: clientId,
        redirect_uri: redirectUri
      })).to.be.ok();
    });

    it('should redirect user to login', function() {
      var spyRedirect = sandbox.spy();
      var req = {
        session: {},
        query: query
      };
      controller.authorizeGet(req, {redirect: spyRedirect});
      expect(spyRedirect.calledWith('/oauth/login?redirect=/oauth/authorize&client_id=' +
          req.query.client_id + '&redirect_uri=' + req.query.redirect_uri)).to.be.ok();
    });
  });
});
