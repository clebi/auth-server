/*
Copyright 2016 Clément Bizeau

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var config = require('./config');
var bunyan = require('bunyan');
var bunyanLogstash = require('bunyan-logstash-tcp');
var expressBunyan = require('express-bunyan-logger');
var confLoggers = config.get('auth_server:logging:loggers');
var confTransports = config.get('auth_server:logging:transports');

var logstashStream = bunyanLogstash.createStream({
  host: config.get('auth_server_logstash_host') || confTransports.logstash.host,
  port: config.get('auth_server_logstash_port') || confTransports.logstash.port
});

module.exports = {
  express: expressBunyan({
    name: 'express',
    streams: [
      {
        level: confLoggers.express.console.level,
        stream: process.stdout
      },
      {
        type: 'raw',
        level: confLoggers.express.logstash.info,
        stream: logstashStream
      }
    ]
  }),
  errors: bunyan.createLogger({
    name: 'errors',
    streams: [
      {
        level: confLoggers.errors.console.level,
        stream: process.stdout
      },
      {
        type: 'raw',
        level: confLoggers.errors.logstash.level,
        stream: logstashStream
      }
    ]
  }),
  auth: bunyan.createLogger({
    name: 'auth',
    streams: [{
      type: 'raw',
      level: 'info',
      stream: logstashStream
    }]
  })
};
