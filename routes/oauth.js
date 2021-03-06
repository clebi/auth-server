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
var oauthServer = require('oauth2-server');
var controller = require('../controllers/oauth');
var router = new express.Router();
var config = require('../config/config');
var authMiddleware = require('../middlewares/authMiddleware');

var oauth = oauthServer({
  model: require('../services/oauthService'),
  grants: ['authorization_code', 'password'],
  authCodeLifetime: 1200,
  debug: true
});

router.post(config.get('auth_server:path:introspect'), authMiddleware.basicAuth, controller.introspectPost);

// Handle token grant requests
router.all(config.get('auth_server:path:token'), oauth.grant());

// Show them the "do you authorise xyz app to access your content?" page
router.get(config.get('auth_server:path:authorize'), controller.authorizeGet);

// Handle authorise
router.post(
  config.get('auth_server:path:authorize'),
  controller.authorizePost, oauth.authCodeGrant(function(req, next) {
  // The first param should to indicate an error
  // The second param should a bool to indicate if the user did authorise the app
  // The third param should for the user/uid (only used for passing to saveAuthCode)
    next(null, req.body.allow === 'true', req.session.user.user_id, req.session.user);
  })
);

// Show login
router.get(config.get('auth_server:path:login'), controller.loginGet);

// Handle login
router.post(config.get('auth_server:path:login'), controller.loginPost);

router.use(oauth.errorHandler());

module.exports = router;
