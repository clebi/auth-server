var express = require('express'),
    oauthServer = require('oauth2-server'),
    models = require('../models'),
    router = express.Router();

oauth = oauthServer({
  model: require('../oauthModel'),
  grants: ['authorization_code', 'password'],
  authCodeLifetime: 1200,
  debug: true
});

// Handle token grant requests
router.all('/token', oauth.grant());

// Show them the "do you authorise xyz app to access your content?" page
router.get('/authorize', function (req, res, next) {
  if (!req.session.user) {
    // If they aren't logged in, send them to your own login implementation
    return res.redirect('/oauth/login?redirect=/oauth/authorize&client_id=' +
        req.query.client_id + '&redirect_uri=' + req.query.redirect_uri);
  }

  res.render('authorize', {
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri
  });
});

// Handle authorise
router.post('/authorize', function (req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login?client_id=' + req.query.client_id +
      '&redirect_uri=' + req.query.redirect_uri);
  }

  next();
}, oauth.authCodeGrant(function (req, next) {
  // The first param should to indicate an error
  // The second param should a bool to indicate if the user did authorise the app
  // The third param should for the user/uid (only used for passing to saveAuthCode)
  next(null, req.body.allow === 'true', req.session.user.user_id, req.session.user);
}));

// Show login
router.get('/login', function (req, res, next) {
  res.render('login', {
    redirect: req.query.redirect,
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri
  });
});

// Handle login
router.post('/login', function (req, res, next) {
  models.sequelize.transaction(function(t) {
    return models.User.findOne({
      where: {
        username: req.body.username,
        password: req.body.password
      }
    }).then(function(user) {
      if(!user) {
        return res.render('login', {
          redirect: req.body.redirect,
          client_id: req.body.client_id,
          redirect_uri: req.body.redirect_uri
        });
      }
      req.session.user = user;
      return res.redirect(req.body.redirect + '?client_id=' +
          req.body.client_id + '&redirect_uri=' + req.body.redirect_uri);
    });
  });
});

router.use(oauth.errorHandler());

module.exports = router
