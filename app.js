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

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var loggers = require('./config/loggers');
var config = require('./config/config');

var oauth = require('./routes/oauth');

var app = express();

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(loggers.express);
app.use(cookieParser());
app.use(session({
  secret: 'expapp',
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  req.config = {
    path: config.get('path')
  };
  if (!req.config.path || !req.config.path.base || !req.config.path.authorize || !req.config.path.login) {
    throw new Error('missing path configuration');
  }
  next();
});

app.set('view engine', 'jade');

app.use(config.get('path:base'), oauth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  loggers.error.error(err);
  res.status(err.status || 500);
  res.send();
});

module.exports = app;
