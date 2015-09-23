var config
    , latentIntervalHandle
    , heartbeatIntervalHandle = null;

Connectivity = {
    _callbacks: {}
    , _isSlow: new ReactiveVar(false)
    , latency: new ReactiveVar(0)
};

Connectivity.monitor = function(callbacks, maxLatency){
    // set config defaults
    config = _.defaults({}, {
        maxLatency: maxLatency || 10000
    });

    this._callbacks = _.extend({
        onError: function(error){
            if (! _.isUndefined(console)) {
                console.error(error);
            }
        }
    }, callbacks);

    this._monitor();
};

Connectivity.isSlow = function(){
    return this._isSlow.get();
}

Connectivity._monitor = function(){
    var self = this
        , beforeConnection = true;

    // Monitor
    Tracker.autorun(function(){
        if (! Meteor.status().connected) {
            if (latentIntervalHandle) {
                Meteor.clearInterval(latentIntervalHandle);
            }
            if (beforeConnection) {
                beforeConnection = false;
            } else {
                self._callbacks.onError('Meteor has disconnected!');
            }
        } else {
            // Calculate the threshold for considering a connection slow using the heartbeat roundtrip duration and the maxLatency
            var interval = Meteor.connection._heartbeatTimeout * 2 + config.maxLatency;
            latentIntervalHandle = Meteor.setInterval(function(){
                if (Meteor.connection._heartbeat._heartbeatIntervalHandle === heartbeatIntervalHandle) {
                    // we've detected a slow connection based on our configured limits
                    self._isSlow.set(true);
                    self._callbacks.onSlowConnection && self._callbacks.onSlowConnection();
                } else {
                    self._isSlow.set(false);
                    heartbeatIntervalHandle = Meteor.connection._heartbeat._heartbeatIntervalHandle;
                }
            }, interval);
        }
    });  
};