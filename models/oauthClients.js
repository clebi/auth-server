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
  var OauthClient = sequelize.define('OauthClient', {
    client_id: {type: DataTypes.STRING, primaryKey: true},
    client_secret: DataTypes.STRING,
    redirect_uri: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        OauthClient.hasMany(models.OauthCode, {foreignKey: 'fk_client_id'});
        OauthClient.hasMany(models.OauthAccessToken, {foreignKey: 'fk_client_id'});
      }
    }
  });
  return OauthClient;
};
