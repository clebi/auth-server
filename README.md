# Auth-Server

[![Build Status](https://travis-ci.org/clebi/auth-server.svg?branch=master)](https://travis-ci.org/clebi/auth-server)

Node/Express implementation of an Oauth2 authorization server. This would be used in a micro-services architecture.

Express logs are sent to Logstash through a TCP socket for simpler setup (need to be changed in the future).

The server use Sequelize to access the database that will store all the data.

In the future, it needs to be able to force user scopes. User will be inserted with a set of scopes that it can access. The server will be responsible for what data the user can access to.

TODO:
* Add users management
* Logstash transport
* Add scopes to users
