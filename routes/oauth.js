var express = require('express'),
    oauthServer = require('oauth2-server'),
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
  next(null, req.body.allow === 'true', req.session.user.id, req.session.user);
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
  // Insert your own login mechanism
  if (req.body.username !== 'test') {
    res.render('login', {
      redirect: req.body.redirect,
      client_id: req.body.client_id,
      redirect_uri: req.body.redirect_uri
    });
  } else {
    // Successful logins should send the user back to the /oauth/authorise
    // with the client_id and redirect_uri (you could store these in the session)
    req.session.user = {
      username: req.body.username,
      id: 1
    };
    return res.redirect(req.body.redirect + '?client_id=' +
        req.body.client_id + '&redirect_uri=' + req.body.redirect_uri);
  }
});

router.use(oauth.errorHandler());

module.exports = router
