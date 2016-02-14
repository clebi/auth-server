var config = require('./config');
var bunyan = require('bunyan');
var bunyanLogstash = require('bunyan-logstash');
var expressBunyan = require('express-bunyan-logger');

module.exports = {
  app: bunyan.createLogger({
    name: 'app',
    streams: [{
      level: config.get('server:logging:app:console:level'),
      stream: process.stdout
    },
    {
      level: config.get('server:logging:app:file:level'),
      path: config.get('server:logging:app:file:path')
    }]
  }),
  express: expressBunyan({
    name: 'express',
    streams: [
      {
        level: config.get('server:logging:express:console:level'),
        stream: process.stdout
      },
      {
        type: 'raw',
        level: config.get('server:logging:express:logstash:level'),
        stream: bunyanLogstash.createStream({
          host: '192.168.56.3',
          port: 5699
        })
      }
    ]
  }),
  error: bunyan.createLogger({
    name: 'error',
    streams: [{
      level: config.get('server:logging:error:console:level'),
      stream: process.stdout
    },
    {
      level: config.get('server:logging:error:file:level'),
      path: config.get('server:logging:error:file:path')
    }]
  })
};
