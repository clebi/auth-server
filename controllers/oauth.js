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

module.exports.loginPost = function(req, res, next) {
  return userService.getUser(req.body.username, req.body.password).then(function(user) {
    req.session.user = user;
    res.redirect(req.body.redirect + '?client_id=' +
        req.body.client_id + '&redirect_uri=' + req.body.redirect_uri);
  }).catch(function(error) {
    if (error instanceof userService.UserNotFound) {
      return res.render('login', {
        title: 'Login',
        redirect: req.body.redirect,
        client_id: req.body.client_id,
        redirect_uri: req.body.redirect_uri
      });
    }
    next(error);
  });
};
