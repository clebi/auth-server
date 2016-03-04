# Auth-Server

[![Build Status](https://travis-ci.org/clebi/auth-server.svg?branch=master)](https://travis-ci.org/clebi/auth-server)

Node/Express implementation of an Oauth2 authorization server.

Express logs are sent to logstash through a TCP socket for simpler setup (need to be changed in the future).

The server use Sequelize to access the database that will store all the data.

TODO:
* Add users UI
* Logstash transport
* Add scopes to users
