var config = require('./config');
var bunyan = require('bunyan');
var bunyanLogstash = require('bunyan-logstash');
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
    streams: [
      {
        level: 'info',
        stream: process.stdout
      },
      {
        type: 'raw',
        level: 'info',
        stream: bunyanLogstash.createStream({
          host: '192.168.56.3',
          port: 5699
        })
      }
    ]
  })
};
