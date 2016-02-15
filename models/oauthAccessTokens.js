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

module.exports = function(sequelize, DataTypes) {
  var AccessToken = sequelize.define('OauthAccessToken', {
    access_token: {type: DataTypes.STRING, primaryKey: true},
    expires: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        AccessToken.belongsTo(models.User, {foreignKey: 'fk_user_id'});
        AccessToken.belongsTo(models.OauthClient, {foreignKey: 'fk_client_id'});
      }
    }
  });
  return AccessToken;
};
