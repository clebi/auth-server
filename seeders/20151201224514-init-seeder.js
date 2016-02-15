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
  up: function(queryInterface) {
    var now = new Date();
    return queryInterface.bulkInsert('Users', [{
      user_id: 1,
      username: 'expuser',
      password: bcrypt.hashSync('expuser', 10),
      createdAt: now,
      updatedAt: now
    }], {}).then(function() {
      return queryInterface.bulkInsert('OauthClients', [{
        client_id: 'expapp',
        client_secret: 'expapp',
        redirect_uri: 'http://localhost:3000/',
        createdAt: now,
        updatedAt: now
      }]);
    });
  },

  down: function(queryInterface) {
    return queryInterface.bulkDelete('Users', [{
      user_id: 1
    }], {}).then(function() {
      return queryInterface.bulkDelete('OauthClients', [{
        client_id: 'expapp'
      }]);
    });
  }
};
