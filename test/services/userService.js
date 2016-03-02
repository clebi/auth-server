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

/* eslint max-nested-callbacks: [2, 6] */

var expect = require('expect.js');
var userService = require('../../services/userService');
var models = require('../../models');
var bcrypt = require('bcrypt');

describe('userService', function() {
  describe('getUser', function() {
    var username = 'test_get_user_username';
    var password = 'test_get_user_password';

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        models.sequelize.transaction(function(t) {
          return models.User.create({
            username: username,
            password_raw: password
          }, {transaction: t});
        }).then(function() {
          done();
        }).catch(function(error) {
          done(error);
        });
      });
    });

    it('should return a user', function(done) {
      userService.getUser(username, password).then(function(user) {
        expect(user).not.to.be(undefined);
        expect(user.user_id).to.be.above(0);
        expect(user.username).to.be(username);
        expect(bcrypt.compareSync(password, user.password)).to.be.ok();
        done();
      }).catch(function(error) {
        done(error);
      });
    });

    it('should throw an error for client not found (missing username)', function(done) {
      userService.getUser('missing_username', password).catch(function(error) {
        expect(error).to.be.a(userService.UserNotFound);
        done();
      });
    });

    it('sould throw an error for client nout found (bad password)', function(done) {
      userService.getUser(username, 'bad_password').catch(function(error) {
        expect(error).to.be.a(userService.UserNotFound);
        done();
      });
    });
  });
});
