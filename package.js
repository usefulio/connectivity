Package.describe({
  name: 'useful:connectivity',
  version: '2.0.0',
  summary: 'Monitors connection speed',
  git: 'https://github.com/usefulio/connectivity.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use([
    'underscore'
    , 'reactive-var'
  ], 'client');

  api.addFiles([
    'client/connectivity.js'
  ], 'client');

  api.addFiles([
    'server/methods/ping.js'
  ], 'server');

  api.export('Connectivity');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('useful:connectivity');
  api.addFiles('tests/connectivity-tests.js');
});
