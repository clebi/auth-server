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
 * Client not found error
 * @constructor
 * @param {string} clientId if of the client to find
 */
function ClientNotFound(clientId) {
  Error.call(this);
  this.message = 'unable to find client with id: ' + clientId;
}
util.inherits(ClientNotFound, Error);
module.exports.ClientNotFound = ClientNotFound;

/**
 * get a client from its id
 * @param {string} clientId of the client we want to find
 * @return {Promise} a promise on get client result
 */
module.exports.getClient = function(clientId) {
  return new Promise(function(resolve, reject) {
    models.sequelize.transaction(function(t) {
      return models.OauthClient.findOne({
        where: {
          client_id: clientId
        }
      }, {transaction: t});
    }).then(function(client) {
      if (!client) {
        reject(new ClientNotFound(clientId));
      }
      resolve(client);
    }).catch(function(error) {
      reject(error);
    });
  });
};
