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
  var clientId = 'test_client_id';
  var redirectUri = 'test_redirect_uri';
  var config = {
    path: {
      base: '/test',
      authorize: 'athorize',
      login: '/login'
    }
  };
  var query = {
    client_id: clientId,
    redirect_uri: redirectUri
  };
  var user = {
    user_id: 42,
    username: 'test_login_post',
    password: 'test_login_post'
  };

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('authorize post', function() {
    it('should redirect to login', function() {
      var req = {
        config: config,
        session: {},
        query: query
      };
      var spyRedirect = sandbox.spy();
      controller.authorizePost(req, {redirect: spyRedirect});
      expect(spyRedirect.calledWith(config.path.base + config.path.login +
        '?client_id=' + clientId +
        '&redirect_uri=' + redirectUri)).to.be.ok();
    });

    it('sould call next callback', function() {
      var req = {
        session: {
          user: user
        },
        query: query,
        loggers: {
          auth: {
            info: sandbox.spy()
          }
        }
      };
      var spyNext = sandbox.spy();
      var spyRedirect = sandbox.spy();
      controller.authorizePost(req, {redirect: spyRedirect}, spyNext);
      expect(spyNext.called).to.be.ok();
      expect(spyRedirect.called).to.not.be.ok();
      expect(req.loggers.auth.info.calledWith({
        event: 'authorize',
        client_id: clientId,
        redirect_uri: redirectUri,
        user_id: user.user_id,
        username: user.username
      })).to.be.ok();
    });
  });

  describe('authorize get', function() {
    it('should render authorize page', function() {
      var req = {
        config: config,
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
        redirect_uri: redirectUri,
        post_url: config.path.base + config.path.authorize
      })).to.be.ok();
    });

    it('should redirect user to login', function() {
      var spyRedirect = sandbox.spy();
      var req = {
        config: config,
        session: {},
        query: query
      };
      controller.authorizeGet(req, {redirect: spyRedirect});
      expect(spyRedirect.calledWith(config.path.base + config.path.login +
          '?redirect=' + config.path.base + config.path.authorize +
          '&client_id=' + req.query.client_id +
          '&redirect_uri=' + req.query.redirect_uri)).to.be.ok();
    });
  });
});
