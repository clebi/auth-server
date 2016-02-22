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

var userService = require('../services/userService');
var OauthAccessTokenService = require('../services/oauthAccessTokenService');
var Promise = require('bluebird');

/**
 * controller for authorize get, redirect to login if no user, render authorize page if user data is there
 * @param {object} req request
 * @param {object} res response
 */
module.exports.authorizeGet = function(req, res) {
  if (!req.session.user) {
    // If they aren't logged in, send them to your own login implementation
    res.redirect(req.config.path.base + req.config.path.login +
        '?redirect=' + req.config.path.base + req.config.path.authorize +
        '&client_id=' + req.query.client_id +
        '&redirect_uri=' + req.query.redirect_uri);
    return;
  }

  res.render('authorize', {
    title: 'Authorize',
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri,
    post_url: req.config.path.base + req.config.path.authorize
  });
};

/**
 * controller for authorize authorize post, redirect to login if no user, next middleware if login
 * @param {object} req request
 * @param {object} res response
 * @param {callback} next jump to next middleware
 */
module.exports.authorizePost = function(req, res, next) {
  if (!req.session.user) {
    res.redirect(req.config.path.base + req.config.path.login +
      '?client_id=' + req.query.client_id +
      '&redirect_uri=' + req.query.redirect_uri);
    return;
  }
  next();
};

/**
 * controller for login page, render the login page
 * @param {object} req request
 * @param {object} res response
 */
module.exports.loginGet = function(req, res) {
  res.render('login', {
    title: 'Login',
    redirect: req.query.redirect,
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri,
    post_url: req.config.path.base + req.config.path.login
  });
};

module.exports.loginPost = function(req, res, next) {
  return userService.getUser(req.body.username, req.body.password).then(function(user) {
    req.session.user = user;
    res.redirect(req.body.redirect + '?client_id=' +
        req.body.client_id + '&redirect_uri=' + req.body.redirect_uri);
  }).catch(function(error) {
    if (error instanceof userService.UserNotFound) {
      res.render('login', {
        title: 'Login',
        redirect: req.body.redirect,
        client_id: req.body.client_id,
        redirect_uri: req.body.redirect_uri,
        post_url: req.config.path.base + req.config.path.login
      });
      return;
    }
    next(error);
  });
};

module.exports.introspectPost = function(req, res, next) {
  return new Promise(function(resolve) {
    if (!req.body.token) {
      res.status(400).json({code: 400, message: 'missing token'});
      resolve();
      return;
    }
    OauthAccessTokenService.getAccessToken(req.body.token).then(function(token) {
      return Promise.join(token, token.getUser(), token.getOauthClient());
    }).spread(function(token, user, client) {
      var now = new Date();
      res.status(200).json({
        active: now < token.expires,
        client_id: client.client_id,
        username: user.username,
        token_type: 'access_token'
      });
      resolve();
    }).catch(function(error) {
      if (error instanceof OauthAccessTokenService.OauthAccessTokenNotFound) {
        res.status(401).json({code: 400, message: 'invalid token'});
        resolve();
        return;
      }
      next(error);
      resolve();
    });
  });
};
