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
          },
          onUpdate: 'RESTRICT',
          onDelete: 'CASCADE'
        },
        fk_client_id: {
          type: Sequelize.STRING,
          references: {
            model: 'OauthClients',
            key: 'client_id'
          },
          onUpdate: 'RESTRICT',
          onDelete: 'CASCADE'
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
          },
          onUpdate: 'RESTRICT',
          onDelete: 'CASCADE'
        },
        fk_client_id: {
          type: Sequelize.STRING,
          references: {
            model: 'OauthClients',
            key: 'client_id'
          },
          onUpdate: 'RESTRICT',
          onDelete: 'CASCADE'
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

  down: function(queryInterface) {
    return queryInterface.dropTable('OauthAccessTokens').then(function() {
      return queryInterface.dropTable('OauthCodes');
    }).then(function() {
      return queryInterface.dropTable('OauthClients');
    }).then(function() {
      return queryInterface.dropTable('Users');
    });
  }
};
