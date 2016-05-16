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

var bcrypt = require('bcrypt');

module.exports = {
  up: function(queryInterface, Sequelize) {
    var now = new Date();
    var expires = new Date(2222, 12, 12);
    return queryInterface.bulkInsert('Users', [{
      user_id: 2,
      username: 'projecter_user',
      password: bcrypt.hashSync('projecter', 10),
      createdAt: now,
      updatedAt: now
    }], {}).then(function() {
      return queryInterface.bulkInsert('OauthClients', [{
        client_id: 'projecter',
        client_secret: 'projecter',
        redirect_uri: 'http://localhost:9000/',
        createdAt: now,
        updatedAt: now
      }]);
    }).then(function() {
      return queryInterface.bulkInsert('ClientGrantTypes', [{
        grant_type: 'auth_code',
        fk_client_id: 'projecter',
        createdAt: now,
        updatedAt: now
      }]);
    }).then(function() {
      return queryInterface.bulkInsert('ResourceServers', [{
        resource_server_id: 'projecter',
        secret: 'projecter',
        enabled: true,
        createdAt: now,
        updatedAt: now
      }]);
    }).then(function() {
      return queryInterface.bulkInsert('OauthAccessTokens', [{
        access_token: 'a4efa8d380c1d8a79e002a7dcfef435c7f990452',
        expires: expires,
        fk_user_id: 2,
        fk_client_id: 'projecter',
        createdAt: now,
        updatedAt: now
      }]);
    });
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('OauthAccessTokens', [{
      access_token: 'a4efa8d380c1d8a79e002a7dcfef435c7f990452'
    }]).then(function() {
      return queryInterface.bulkDelete('ClientGrantTypes', [{
        grant_type: 'auth_code',
        fk_client_id: 'projecter'
      }]);
    }).then(function() {
      return queryInterface.bulkDelete('ResourceServers', [{
        resource_server_id: 'projecter'
      }], {});
    }).then(function() {
      return queryInterface.bulkDelete('Users', [{
        user_id: 2
      }], {});
    }).then(function() {
      return queryInterface.bulkDelete('OauthClients', [{
        client_id: 'projecter'
      }]);
    });
  }
};
