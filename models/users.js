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
