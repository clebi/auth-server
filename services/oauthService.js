var models = require('../models');
var sequelize = require('sequelize');

var model = module.exports;

model.getAccessToken = function(bearerToken, callback) {
  models.sequelize.transaction(function(t) {
    return models.OauthAccessToken.findOne({
      where: {
        access_token: bearerToken
      }
    }, {transaction: t}).then(function(token) {
      if(!token)
        return callback();
      return token.getUser({transaction: t}).then(function(user) {
        callback(false, {
          expires: token.expires,
          user: user
        });
      });
    });
  }).catch(function(error) {
    callback(error);
  });
};

model.saveAccessToken = function (accessToken, clientId, expires, user, callback) {
  models.sequelize.transaction(function(t) {
    return models.OauthClient.findOne({
      where: {
        client_id: clientId
      }
    }, {transaction: t}).then(function(client) {
      if(!client)
        return callback();
      return models.User.findOne({
        where: {
          user_id: user.id
        }
      }, {transaction: t}).then(function(user) {
        if(!user)
          return callback();
        return models.OauthAccessToken.create({
          access_token: accessToken,
          expires: expires
        }, {transaction: t}).then(function(token) {
          return client.addOauthAccessToken(token, {transaction: t}).then(function(client) {
            return user.addOauthAccessToken(token, {transaction: t}).then(function(user) {
              callback(false);
            });
          });
        });
      });
    }).catch(function(error) {
      callback(error);
    });
  });
};

model.getClient = function(clientId, clientSecret, callback) {
  models.sequelize.transaction(function(t) {
    return models.OauthClient.findOne({
      where: {
        client_id: clientId,
      }
    }, {transaction: t}).then(function(oauthClient) {
      if(!oauthClient)
        return callback();
      if(clientSecret !== null && oauthClient.client_secret !== clientSecret)
        return callback();
      callback(null, {
        clientId: oauthClient.client_id,
        clientSecret: oauthClient.client_secret,
        redirectUri: oauthClient.redirect_uri
      });
    }).catch(function(error) {
      callback(error);
    });
  });
};

model.grantTypeAllowed = function (clientId, grantType, callback) {
  callback(false, true);
};

model.getAuthCode = function(authCode, callback) {
  models.sequelize.transaction(function(t) {
    return models.OauthCode.findOne({
      where: {
        code: authCode
      }
    }, {transaction: t}).then(function(code) {
      if(!code)
        return callback();
      return code.getOauthClient({transaction: t}).then(function(client) {
        return code.getUser({transaction: t}).then(function(user) {
          callback(false, {
            clientId: client.client_id,
            expires: code.expires,
            userId: user.user_id
          });
        });
      });
    }).catch(function(error) {
      callback(error);
    });
  });
};

model.saveAuthCode = function(authCode, clientId, expires, user, callback) {
  models.sequelize.transaction(function(t) {
    return models.OauthClient.findOne({
      where: {
        client_id: clientId,
      }
    }, {transaction: t}).then(function(client) {
      if(!client)
        return callback();
      return models.User.findOne({
        where: {
          user_id: user
        }
      }, {transaction: t}).then(function(user) {
        if(!user)
          return callback();
        return models.OauthCode.create({
          code: authCode,
          expires: expires
        }, {transaction: t}).then(function(code) {
          return client.addOauthCode(code, {transaction: t}).then(function(client) {
            return user.addOauthCode(code, {transaction: t}).then(function(user) {
              callback();
            });
          });
        });
      });
    }).catch(function(error) {
      callback(error);
    });
  });
};
