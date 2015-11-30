"use strict";

module.exports = function(sequelize, DataTypes) {
  var authCode = sequelize.define('AuthCode', {
    code: {type: DataTypes.STRING, primaryKey: true},
    expires: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        authCode.belongsTo(models.OauthClient, {foreignKey: 'fk_client_id'});
        authCode.belongsTo(models.User, {foreignKey: 'fk_user_id'});
      }
    }
  });
  return authCode;
};
