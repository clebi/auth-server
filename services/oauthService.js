var models = require('../models');
var Promise = require('bluebird');

var model = module.exports;

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
    callback();
  }).catch(function(error) {
    callback(error);
  });
};

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
    callback(null, {
      clientId: oauthClient.client_id,
      clientSecret: oauthClient.client_secret,
      redirectUri: oauthClient.redirect_uri
    });
  }).catch(function(error) {
    callback(error);
  });
};

model.grantTypeAllowed = function(clientId, grantType, callback) {
  callback(false, true);
};

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
