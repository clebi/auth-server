var models = require('./models'),
  model = module.exports;

model.getAccessToken = function(bearerToken, callback) {
  console.log('token: ', bearerToken);
};

model.saveAccessToken = function (accessToken, clientId, expires, user, callback) {
  models.OauthClient.findOne({
    where: {
      client_id: clientId
    }
  }).then(function(client) {
    if(!client)
      return callback("unable to find client");
    return models.User.findOne({
      where: {
        user_id: user.id
      }
    }).then(function(user) {
      if(!user)
        return callback("unable to find user");
      return models.OauthAccessToken.create({
        access_token: accessToken,
        expires: expires
      }).then(function(token) {
        return client.addOauthAccessToken(token).then(function(client) {
          return user.addOauthAccessToken(token).then(function(user) {
            callback(false);
          });
        });
      });
    });
  }).catch(function(error) {
    callback(error);
  });
};

model.getClient = function(clientId, clientSecret, callback) {
  models.OauthClient.findOne({
    where: {
      client_id: clientId,
    }
  }).then(function(oauthClient) {
    if(!oauthClient)
      return callback("unable to find client");
    if(clientSecret !== null && oauthClient.client_secret !== clientSecret)
      return callback("secret is wrong");
    callback(null, {
      clientId: oauthClient.client_id,
      clientSecret: oauthClient.client_secret,
      redirectUri: oauthClient.redirect_uri
    });
  }).catch(function(error) {
    callback(error);
  });
};

model.grantTypeAllowed = function (clientId, grantType, callback) {
  callback(false, true);
};

model.getAuthCode = function(authCode, callback) {
  models.OauthCode.findOne({
    where: {
      code: authCode
    }
  }).then(function(code) {
    if(!code)
      callback('unable to find auth code');
    return code.getOauthClient().then(function(client) {
      return code.getUser().then(function(user) {
        callback(false, {
          clientId: client.client_id,
          expires: code.expires,
          userId: user.user_id
        });
      });
    })
  }).catch(function(error) {
    callback(error);
  });
};

model.saveAuthCode = function(authCode, clientId, expires, user, callback) {
  models.OauthClient.findOne({
    where: {
      client_id: clientId,
    }
  }).then(function(client) {
    if(!client)
      callback("unable to find client");
    return models.User.findOne({
      where: {
        user_id: user
      }
    }).then(function(user) {
      if(!user)
        callback("unable to find user");
      return models.OauthCode.create({
        code: authCode,
        expires: expires
      }).then(function(code) {
        return client.addOauthCode(code).then(function(client) {
          return user.addOauthCode(code).then(function(user) {
            callback();
          });
        });
      });
    });
  }).catch(function(error) {
    console.log(error);
    callback(error);
  });
};
