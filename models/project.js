'use strict';

module.exports = function(sequelize, DataTypes) {
  var Project = sequelize.define('Project', {
    id: {type: DataTypes.INTEGER, primaryKey: true},
    name: {type: DataTypes.STRING}
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Project;
};
