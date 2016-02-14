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
