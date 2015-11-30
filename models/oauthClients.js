"use strict";

module.exports = function(sequelize, DataTypes) {
  var OauthClient = sequelize.define("OauthClient", {
    client_id: {type: DataTypes.STRING, primaryKey: true},
    client_secret: DataTypes.STRING,
    redirect_uri: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        OauthClient.hasMany(models.AuthCode, {foreignKey: 'fk_client_id'});
        OauthClient.hasMany(models.OauthAccessToken, {foreignKey: 'fk_client_id'});
      }
    }
  });
  return OauthClient;
};
