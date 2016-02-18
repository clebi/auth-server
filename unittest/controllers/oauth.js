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
var userService = require('../../services/userService');
var controller = require('../../controllers/oauth');
var expect = require('expect.js');
var Promise = require('bluebird');

describe('oauthRoutes', function() {
  var sandbox;
  var stubGetUser;
  var redirect = 'test_login_post';
  var clientId = 'test_login_post';
  var user = {
    user_id: 42,
    username: 'test_login_post',
    password: 'test_login_post'
  };
  var redirectUri = 'test_login_post';

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    stubGetUser = sandbox.stub(userService, 'getUser');
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('login post', function() {
    var req = {
      body: {
        redirect: redirect,
        client_id: clientId,
        username: user.username,
        password: user.password,
        redirect_uri: redirectUri
      },
      session: {}
    };

    it('redirects to param url', function(done) {
      var spyRedirect = sandbox.spy();
      stubGetUser.returns(Promise.resolve(user));
      controller.loginPost(req, {redirect: spyRedirect}).then(function() {
        try {
          expect(req.session.user).to.eql(user);
          expect(stubGetUser.calledWith(user.username, user.password)).to.be.ok();
          expect(spyRedirect.calledWith(redirect + '?client_id=' + clientId + '&redirect_uri=' + redirectUri))
            .to.be.ok();
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should render login', function(done) {
      var spyRender = sandbox.spy();
      stubGetUser.returns(Promise.reject(new userService.UserNotFound('missing_user')));
      controller.loginPost(req, {render: spyRender}).then(function() {
        try {
          expect(stubGetUser.calledWith(user.username, user.password)).to.be.ok();
          expect(spyRender.calledWith('login', {
            title: 'Login',
            redirect: req.body.redirect,
            client_id: req.body.client_id,
            redirect_uri: req.body.redirect_uri
          })).to.be.ok();
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    it('should called next with an error', function(done) {
      var error = new Error('generic_error');
      var spyNext = sandbox.spy();
      stubGetUser.returns(Promise.reject(error));
      controller.loginPost(req, {}, spyNext).then(function() {
        try {
          expect(stubGetUser.calledWith(user.username, user.password)).to.be.ok();
          expect(spyNext.calledWith(error)).to.be.ok();
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });
});
