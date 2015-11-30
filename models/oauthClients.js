"use strict";

module.exports = function(sequelize, DataTypes) {
  var OauthClient = sequelize.define("OauthClient", {
    client_id: {type: DataTypes.STRING, primaryKey: true},
    client_secret: DataTypes.STRING,
    redirect_uri: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        OauthClient.hasMany(models.AuthCode, {foreign_key: 'client_id'});
        OauthClient.hasMany(models.OauthAccessToken, {foreign_key: 'client_id'});
      }
    }
  });
  return OauthClient;
};
