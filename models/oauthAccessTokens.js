"use strict";

module.exports = function(sequelize, DataTypes) {
  var AccessToken = sequelize.define('OauthAccessToken', {
    access_token: {type: DataTypes.STRING, primaryKey: true},
    expires: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        AccessToken.belongsTo(models.User, {foreign_key: 'user_id'});
        AccessToken.belongsTo(models.OauthClient, {foreign_key: 'client_id'});
      }
    }
  });
  return AccessToken;
};
