var models = require('./models'),
  model = module.exports;

model.getClient = function(clientId, clientSecret, callback) {
  models.OauthClient.findOne({
    where: {
      client_id: clientId,
    }
  }).then(function(oauthClient) {
    if(!oauthClient)
      return callback("unable to find client");
    if(clientSecret !== null && oauthClient.client_secret !== clientSecret)
      return callback();
    callback(null, {
      clientId: oauthClient.client_id,
      clientSecret: oauthClient.client_secret,
      redirectUri: oauthClient.redirect_uri
    });
  }).catch(function(error) {
    console.log('error: ', error);
  });
};

model.saveAuthCode = function(authCode, clientId, expires, user, callback) {
  models.OauthClient.findOne({
    where: {
      client_id: clientId,
    }
  }).then(function(client) {
    return models.AuthCode.create({
      code: authCode,
      user_id: user,
      expires: expires
    }).then(function(code) {
      console.log('client: ', client);
      client.addAuthCode(code).then(function(code) {
        callback();
      });
    });
  }).catch(function(error) {
    console.log('error: ', error);
    callback(error);
  });
};
