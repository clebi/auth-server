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
var basicAuth = require('basic-auth');
var resourceServerService = require('../services/resourceServerService');

/**
 * Authentication error
 * @constructor
 * @param {string} message message for the error
 */
function AuthError(message) {
  Error.call(this);
  this.message = message;
}
util.inherits(AuthError, Error);
module.exports.AuthError = AuthError;

/**
 * Basic authentication middleware, use to extract athorization header and validate information against database
 * @param {object} req request information
 * @param {object} res response object
 * @param {function} next callback to jump to next middleware
 * @return {Promise} a promise on result of the middleware
 */
module.exports.basicAuth = function(req, res, next) {
  return new Promise(function(resolve, reject) {
    var authClient = basicAuth(req);
    if (!authClient || !authClient.name || !authClient.pass) {
      reject(new AuthError('unable to authenticate client, bad authorization header'));
      return;
    }
    resolve(authClient);
  }).then(function(authClient) {
    return resourceServerService.getResourceServer(authClient.name).then(function(client) {
      if (client.secret !== authClient.pass) {
        throw new AuthError('unable to authenticate client, bad credentials');
      }
      next();
    });
  }).catch(function(error) {
    if (error instanceof resourceServerService.ResourceServerNotFound || error instanceof AuthError) {
      res.status(401).json({code: 401, message: 'bad credentials'});
      return;
    }
    next(error);
  });
};
