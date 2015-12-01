'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    }).then(function() {
      return queryInterface.createTable('OauthClients', {
        client_id: {
          type: Sequelize.STRING,
          primaryKey: true
        },
        client_secret: {
          type: Sequelize.STRING
        },
        redirect_uri: {
          type: Sequelize.STRING
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        }
      });
    }).then(function() {
      return queryInterface.createTable('OauthCodes', {
        code: {
          type: Sequelize.STRING,
          primaryKey: true
        },
        expires: {
          type: Sequelize.DATE
        },
        fk_user_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Users',
            key: 'user_id'
          }
        },
        fk_client_id: {
          type: Sequelize.STRING,
          references: {
            model: 'OauthClients',
            key: 'client_id'
          }
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        }
      });
    }).then(function() {
      return queryInterface.createTable('OauthAccessTokens', {
        access_token: {
          type: Sequelize.STRING,
          primaryKey: true
        },
        expires: {
          type: Sequelize.DATE
        },
        fk_user_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Users',
            key: 'user_id'
          }
        },
        fk_client_id: {
          type: Sequelize.STRING,
          references: {
            model: 'OauthClients',
            key: 'client_id'
          }
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        }
      });
    });
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('OauthAccessTokens').then(function() {
      return queryInterface.dropTable('OauthCodes');
    }).then(function() {
      return queryInterface.dropTable('OauthClients');
    }).then(function() {
      return queryInterface.dropTable('Users');
    });
  }
};
