Package.describe({
  name: 'useful:connectivity',
  version: '0.0.1',
  summary: 'Monitors connection speed',
  git: 'https://github.com/usefulio/connectivity.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use([
    'ddp'
    , 'underscore'
    , 'reactive-var'
  ], 'client');

  api.addFiles([
    'client/connectivity.js'
  ], 'client');

  api.export('Connectivity');

});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('useful:connectivity');
  api.addFiles('tests/connectivity-tests.js');
});
