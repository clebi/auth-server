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
