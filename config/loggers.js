var winston = require('winston');
var expressWinston = require('express-winston');
var config = require('./config');
var moment = require('moment');

var format = function(options) {
  return '[' + moment(options.timestamp()).format('YYYY-MM-DD HH:mm:ss.SSSSSSSSSZZ') + '] ' +
    options.level.toUpperCase() + ' ' + (undefined === options.message ? '' : options.message) +
    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
};

module.exports = {
  app: new (winston.Logger)({
    transports: [
      new winston.transports.Console({
        timestamp: function() {
          return Date.now();
        },
        level: config.get('logging:app:console:level'),
        formatter: format
      })
    ]
  }),
  express: expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: false,
        timestamp: function() {
          return Date.now();
        },
        formatter: format,
        level: config.get('logging:app:express:level')
      })
    ],
    meta: false,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorStatus: true,
    ignoreRoute: function() {
      return false;
    }
  })
};
