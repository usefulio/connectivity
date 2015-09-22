var config
    , latentIntervalHandle
    , heartbeatIntervalHandle = null;

Connectivity = {
    _callbacks: {}
    , isSlow: new ReactiveVar(false)
    , latency: new ReactiveVar(0)
};

Connectivity.monitor = function(callbacks){
    // set config defaults
    config = _.defaults(Meteor.settings.public.connectivity, {
        maxLatency: 10000 // milliseconds
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

Connectivity._monitor = function(){
    var self = this;

    // Monitor
    Tracker.autorun(function(){
        if (! Meteor.status().connected) {
            if (latentIntervalHandle) {
                Meteor.clearInterval(latentIntervalHandle);
            }
            console.warn('disconnected');
        } else {
            // Calculate the threshold for considering a connection slow using the heartbeat roundtrip duration and the maxLatency
            var interval = Meteor.connection._heartbeatTimeout * 2 + config.maxLatency;
            latentIntervalHandle = Meteor.setInterval(function(){
                if (Meteor.connection._heartbeat._heartbeatIntervalHandle === heartbeatIntervalHandle) {
                    // we've detected a slow connection based on our configured limits
                    self._callbacks.onSlowConnection && self._callbacks.onSlowConnection();
                } else {
                    heartbeatIntervalHandle = Meteor.connection._heartbeat._heartbeatIntervalHandle;
                }
            }, interval);
        }
    });  
};