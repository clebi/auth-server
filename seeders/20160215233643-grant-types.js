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

module.exports = {
  up: function (queryInterface, Sequelize) {
    var now = new Date();
    return queryInterface.bulkInsert('ClientGrantTypes', [{
      grant_type: 'auth_code',
      fk_client_id: 'expapp',
      createdAt: now,
      updatedAt: now
    }]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('ClientGrantTypes', [{
      grant_type: 'auth_code',
      fk_client_id: 'expapp'
    }]);
  }
};
