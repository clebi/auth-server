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

/* eslint max-nested-callbacks: [2, 6] */

var expect = require('expect.js');
var resourceServerService = require('../../services/resourceServerService');
var models = require('../../models');

describe('resourceServerService', function() {
  describe('getResourceServer', function() {
    var testResourceServer = {
      resource_server_id: 'test_resource_server_id',
      secret: 'test_resource_server_secret',
      enabled: true
    };
    var missing_resource_server_id = 'test_resource_server_id_missing';

    before(function(done) {
      return models.sequelize.sync({force: true}).then(function() {
        return models.sequelize.transaction(function(t) {
          return models.ResourceServer.create(testResourceServer, {transaction: t});
        });
      }).then(function() {
        done();
      }).catch(function(error) {
        done(error);
      });
    });

    it('should return a resource server', function(done) {
      resourceServerService.getResourceServer(testResourceServer.resource_server_id).then(function(resourceServer) {
        expect(resourceServer).not.to.be(undefined);
        expect(resourceServer.resource_server_id).to.be(testResourceServer.resource_server_id);
        expect(resourceServer.secret).to.be(testResourceServer.secret);
        expect(resourceServer.enabled).to.be(testResourceServer.enabled);
        done();
      }).catch(function(error) {
        done(error);
      });
    });

    it('should throw an error for resource server not found (missing resource_server_id)', function(done) {
      resourceServerService.getResourceServer(missing_resource_server_id).catch(function(error) {
        try {
          expect(error).to.be.a(resourceServerService.ResourceServerNotFound);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
