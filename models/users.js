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

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    user_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    password_raw: {
      type: DataTypes.VIRTUAL,
      set: function(val) {
        this.setDataValue('password_raw', val);
        this.setDataValue('password', bcrypt.hashSync(val, bcrypt.genSaltSync(10)));
      },
      validate: {
        isLongEnough: function(val) {
          if (val.length < 6) {
            throw new Error('Password is not long enough');
          }
        }
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.OauthAccessToken, {foreignKey: 'fk_user_id'});
        User.hasMany(models.OauthCode, {foreignKey: 'fk_user_id'});
      }
    }
  });
  return User;
};
