var winston = require('winston'),
  config = require('./config');

var loggers = module.exports = {
  app: new (winston.Logger)({
    transports: [
      new winston.transports.Console({
        level: config.get('logging:app:level')
      })
    ]
  })
};
