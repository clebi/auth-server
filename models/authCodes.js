"use strict";

module.exports = function(sequelize, DataTypes) {
  var authCode = sequelize.define('AuthCode', {
    code: {type: DataTypes.STRING, primaryKey: true},
    user_id: DataTypes.INTEGER,
    expires: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        authCode.belongsTo(models.OauthClient, {foreign_key: 'client_id'})
      }
    }
  });
  return authCode;
};
