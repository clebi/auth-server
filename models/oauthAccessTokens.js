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
