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

/**
 * Access token not found error
 * @constructor
 * @param {string} message message for the error
 */
function ResourceServerNotFound(message) {
  Error.call(this);
  this.message = message;
}
util.inherits(ResourceServerNotFound, Error);
module.exports.ResourceServerNotFound = ResourceServerNotFound;

module.exports.getResourceServer = function(resourceServerId) {
  return models.sequelize.transaction(function(t) {
    return models.ResourceServer.findOne({
      where: {
        resource_server_id: resourceServerId
      }
    }, {transaction: t}).then(function(resourceServer) {
      if (!resourceServer) {
        return Promise.reject(new ResourceServerNotFound());
      }
      return Promise.resolve(resourceServer);
    });
  });
};
