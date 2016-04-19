'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('ResourceServers', {
      resource_server_id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      secret: {
        type: Sequelize.STRING
      },
      enabled: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface) {
    return queryInterface.dropTable('ResourceServers');
  }
};
