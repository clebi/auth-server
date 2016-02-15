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

'use strict';

var models = require('../models');
var bcrypt = require('bcrypt');

/**
 * User not found error with username
 * @constructor
 * @param {string} username by which the user was not found
 */
function UserNotFound(username) {
  Error.call(this);
  this.message = 'unable to find user with username: ' + username;
}
UserNotFound.prototype = Error.prototype;
module.exports.UserNotFound = UserNotFound;

module.exports.getUser = function(username, password) {
  return new Promise(function(resolve, reject) {
    models.sequelize.transaction(function(t) {
      return models.User.findOne({
        where: {
          username: username
        }
      }, {trasaction: t});
    }).then(function(user) {
      if (!user || !bcrypt.compareSync(password, user.password)) {
        reject(new UserNotFound(username));
      }
      resolve(user);
    }).catch(function(error) {
      reject(error);
    });
  });
};
