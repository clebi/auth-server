var winston = require('winston');
var config = require('./config');

module.exports = {
  app: new (winston.Logger)({
    transports: [
      new winston.transports.Console({
        level: config.get('logging:app:level')
      })
    ]
  })
};
