var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var oauthServer = require('oauth2-server');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var winston = require('winston');
var expressWinston = require('express-winston');

var routes = require('./routes/index');
var oauth = require('./routes/oauth');
var users = require('./routes/users');

var app = express();

app.oauth = oauthServer({
  model: require('./services/oauthService'),
  grants: ['authorization_code', 'password'],
  authCodeLifetime: 1200,
  debug: true
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: false,
      colorize: true
    }),
  ],
  meta: false,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorStatus: true,
  ignoreRoute: function (req, res) { return false; }
}));

app.use(cookieParser());
app.use(session({
  secret: 'expapp',
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'jade');

app.use('/', routes);
app.use('/oauth', oauth);
app.use('/users', app.oauth.authorise(), users);

app.use(app.oauth.errorHandler());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message
  });
});

module.exports = app;
