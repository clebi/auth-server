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

var util = require('util');
var models = require('../models');
var Promise = require('bluebird');

/**
 * Access token not found error
 * @constructor
 * @param {string} message message for the error
 */
function OauthAccessTokenNotFound(message) {
  Error.call(this);
  this.message = message;
}
util.inherits(OauthAccessTokenNotFound, Error);
module.exports.OauthAccessTokenNotFound = OauthAccessTokenNotFound;

/**
 * get an access token information from token
 * @param {string} accessToken the access token string
 * @return {Promise} promise to access token information
 */
module.exports.getAccessToken = function(accessToken) {
  return new Promise(function(resolve, reject) {
    models.sequelize.transaction(function(t) {
      return models.OauthAccessToken.findOne({
        where: {
          access_token: accessToken
        }
      }, {transaction: t});
    }).then(function(token) {
      if (!token || !token.fk_user_id || !token.fk_client_id) {
        reject(new OauthAccessTokenNotFound('token not found with id: ' + accessToken));
        return;
      }
      resolve(token);
    }).catch(function(error) {
      reject(error);
    });
  });
};
