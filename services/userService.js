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
