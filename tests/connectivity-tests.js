Tinytest.add('Connectivity - sync - Connectivity object exists', function (test) {
  test.isNotNull(Connectivity);
  test.notEqual(typeof Connectivity, undefined);
});

if (Meteor.isClient) {
  Tinytest.addAsync('Connectivity - async - Use a negative maxLatency to simulate a slow connection', function (test, next) {
    Connectivity.monitor({
      'onSlowConnection': function () {
        test.equal(Connectivity.isSlow(), true);
        next();
      }
    }, -28000);
  });
}
