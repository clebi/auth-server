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

describe('oauthRoutes', function() {
  var sandbox;
  var stubGetUser;
  var spyRedirect;
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
    spyRedirect = sandbox.spy();
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
  });
});
