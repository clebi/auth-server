# Auth-Server

[![Build Status](https://travis-ci.org/clebi/auth-server.svg?branch=master)](https://travis-ci.org/clebi/auth-server)

Node/Express implementation of an Oauth2 authorization server.

Express logs are sent to logstash through a TCP socket for simpler setup.

The server use Sequelize to access the database that will store all the data.
