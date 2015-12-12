var config = require('./config');
var bunyan = require('bunyan');
var expressBunyan = require('express-bunyan-logger');

module.exports = {
  app: bunyan.createLogger({
    name: 'app',
    streams: [
      {
        level: config.get('server:logging:app:console:level'),
        stream: process.stdout
      }
    ]
  }),
  express: expressBunyan({
    name: 'express',
    streams: [{
      level: 'info',
      stream: process.stdout
    }]
  })
};
