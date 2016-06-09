'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    var now = new Date();
    return queryInterface.bulkInsert('ResourceServers', [{
      resource_server_id: 'subscriber',
      secret: 'subscriber',
      enabled: true,
      createdAt: now,
      updatedAt: now
    }]);
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('ResourceServers', [{
      resource_server_id: 'subscriber'
    }], {});
  }
};
