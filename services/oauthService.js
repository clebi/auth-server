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

var models = require('../models');
var Promise = require('bluebird');

var model = module.exports;

/**
 * callback for get access token
 * @callback getAccessTokenCallback
 * @param {boolean|Error} error error if there was one, false if not
 * @param {?object}  token access token information
 * @param {Date} token.expires expiration date of the token
 * @param {object} token.user user associated with the token
 * @param {number} token.user.user_id id of the user associated with the token
 * @param {string} token.user.username username of the user
 * @param {string} token.user.password password of the user
 */

/**
 * retrieve an access token
 * @param {string} bearerToken token to retrieve
 * @param {getAccessTokenCallback} callback function to call ater retrieve
 */
model.getAccessToken = function(bearerToken, callback) {
  models.sequelize.transaction(function(t) {
    return models.OauthAccessToken.findOne({
      where: {
        access_token: bearerToken
      }
    }, {transaction: t}).then(function(token) {
      if (!token) {
        throw new Error('token not found');
      }
      return Promise.join(token, token.getUser({transaction: t}));
    });
  }).spread(function(token, user) {
    callback(false, {
      expires: token.expires,
      user: user
    });
  }).catch(function(error) {
    callback(error);
  });
};

/**
 * callback for save access token
 * @callback saveAccessTokenCallback
 * @param {boolean|Error} error error if there was one, false if not
 */

/**
 * save an access token
 * @param {string} accessToken access token to save
 * @param {string} clientId client id to associate with access token
 * @param {Date} expires expiration of the access token
 * @param {object} user user associated with the access token
 * @param {number} user.id id of the user
 * @param {saveAccessTokenCallback} callback callback function to call after save
 */
model.saveAccessToken = function(accessToken, clientId, expires, user, callback) {
  models.sequelize.transaction(function(t) {
    return models.OauthClient.findOne({
      where: {
        client_id: clientId
      }
    }, {transaction: t}).then(function(client) {
      if (!client) {
        throw new Error('unable to find client with id: ' + clientId);
      }
      return [client, models.User.findOne({
        where: {
          user_id: user.id
        }
      }, {transaction: t})];
    }).spread(function(client, dbUser) {
      if (!dbUser) {
        throw new Error('unable to find user with id: ' + user.id);
      }
      return [client, dbUser, models.OauthAccessToken.create({
        access_token: accessToken,
        expires: expires
      }, {transaction: t})];
    }).spread(function(client, dbUser, token) {
      return [client, dbUser, token];
    }).spread(function(client, dbUser, token) {
      return dbUser.addOauthAccessToken(token, {transaction: t});
    });
  }).then(function() {
    callback(false);
  }).catch(function(error) {
    callback(error);
  });
};

/**
 * callback for get client
 * @callback getClientCallback
 * @param {boolean|Error} error error if there was one, false if not
 * @param {?object} client contains all the informations about
 * @param {string} client.clientId id of the client
 * @param {string} client.secret secret of the client
 */

/**
 * retrieve a a client
 * @param {string} clientId id op the client to retrieve
 * @param {string} clientSecret of the client, use to grant access
 * @param {getClientCallback} callback function called after client is retrieved
 */
model.getClient = function(clientId, clientSecret, callback) {
  models.sequelize.transaction(function(t) {
    return models.OauthClient.findOne({
      where: {
        client_id: clientId
      }
    }, {transaction: t}).then(function(oauthClient) {
      if (!oauthClient) {
        throw new Error('client not found with id: ' + clientId);
      }
      if (clientSecret !== null && oauthClient.client_secret !== clientSecret) {
        throw new Error('secrets doesn\'t match');
      }
      return oauthClient;
    });
  }).then(function(oauthClient) {
    callback(false, {
      clientId: oauthClient.client_id,
      clientSecret: oauthClient.client_secret,
      redirectUri: oauthClient.redirect_uri
    });
  }).catch(function(error) {
    callback(error);
  });
};

/**
 * callback for grant type allowed
 * @callback grantTypeAllowedCallback
 * @param {boolean|Error} error error if there was one, false if not
 * @param {boolean} allowed true if the grant type is allowed, false if not
 */

/**
 * get the allowed grant type
 * @param {string} clientId id of the client
 * @param {string} grantType grant type to check
 * @param {grantTypeAllowedCallback} callback function called when grant type checking is done
 */
model.grantTypeAllowed = function(clientId, grantType, callback) {
  models.sequelize.transaction(function(t) {
    return models.OauthClient.findOne({
      where: {
        client_id: clientId
      },
      include: [
        {model: models.ClientGrantType, where: {grant_type: grantType}, required: false}
      ]
    }, {transaction: t});
  }).then(function(client) {
    if (!client) {
      return callback(false, false);
    }
    if (client.ClientGrantTypes.length < 1) {
      return callback(false, false);
    }
    callback(false, true);
  }).catch(function(error) {
    callback(error);
  });
};

/**
 * callback for get authorization code
 * @callback getAuthCodeCallback
 * @param {boolean|Error} Error if there was one, false if not
 * @param {?object} authCode authorization code infromation
 * @param {string} authCode.clientId id of the client associated to the authorization code
 * @param {Date} authCode.expires expiration date of the authorization code
 * @param {number} authCode.userId id of the user associated with the authorization code
 */

/**
 * retrieve an authorization code
 * @param {string} code authorization code to retrieve
 * @param {getAuthCodeCallback} callback function called when authorization code is retrieved
 */
model.getAuthCode = function(code, callback) {
  models.sequelize.transaction(function(t) {
    return models.OauthCode.findOne({
      where: {
        code: code
      }
    }, {transaction: t}).then(function(authCode) {
      if (!authCode) {
        throw new Error('missing auth code with id: ' + code);
      }
      return Promise.join(
        authCode,
        authCode.getOauthClient({transaction: t}),
        authCode.getUser({transaction: t})
      );
    });
  }).spread(function(authCode, oauthClient, user) {
    callback(false, {
      clientId: oauthClient.client_id,
      expires: authCode.expires,
      userId: user.user_id
    });
  }).catch(function(error) {
    callback(error);
  });
};

/**
 * callback for save authorization code
 * @callback saveAuthCodeCallback
 * @param {boolean|Error} error error if there was one, false if not
 */

/**
 * save an authorization code
 * @param {string} authCode authorization code to save
 * @param {string} clientId id of the client associated with the authorization code
 * @param {Date} expires expiration date of the authorization code
 * @param {number} userId id of the user associated with the authorization code
 * @param {saveAuthCodeCallback} callback function called when authorization code is saved
 */
model.saveAuthCode = function(authCode, clientId, expires, userId, callback) {
  models.sequelize.transaction(function(t) {
    return Promise.join(
      models.OauthClient.findOne({
        where: {
          client_id: clientId
        }
      }, {transaction: t}),
      models.User.findOne({
        where: {
          user_id: userId
        }
      }, {transaction: t})
    ).spread(function(client, user) {
      if (!client) {
        throw new Error('client not found with id: ' + clientId);
      }
      if (!user) {
        throw new Error('user not found with id: ' + userId);
      }
      return Promise.join(client, user, models.OauthCode.create({
        code: authCode,
        expires: expires
      }, {transaction: t}));
    }).spread(function(client, user, authCode) {
      return Promise.join(
        authCode.setOauthClient(client, {transaction: t}),
        authCode.setUser(user, {transaction: t})
      );
    });
  }).then(function() {
    callback(false);
  }).catch(function(error) {
    callback(error);
  });
};
