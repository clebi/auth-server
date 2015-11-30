"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    user_id: {type: DataTypes.INTEGER, primaryKey: true},
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.OauthAccessToken, {foreign_key: 'user_id'});
        User.hasMany(models.AuthCode, {foreign_key: 'user_id'});
      }
    }
  });
  return User;
};
