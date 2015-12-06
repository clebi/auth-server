var nconf = module.exports = require('nconf');

nconf.argv({
  conf: {
    alias: 'conf',
    describe: 'configuration file path',
    demand: true,
    type: 'string'
  }
});

nconf.file({
  file: nconf.get('conf'),
  format: require('nconf-yaml')
});
