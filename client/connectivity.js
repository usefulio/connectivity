var config
    , latentIntervalHandle;

Connectivity = {
    _callbacks: {}
    , _isSlow: new ReactiveVar(false)
    //, latency: new ReactiveVar(0) 
    // XXX In its current form, this package does not calculate the latency value, 
    // it only checks if the latency is greater than `maxLatency`
};

Connectivity.monitor = function(callbacks, options){
    // set config defaults
    config = _.defaults({}, {
        maxLatency: options.maxLatency || 2000
        , retryInterval: options.retryInterval || 5000
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

Connectivity.strength = function(){
    return Meteor.status().connected ? (this.isSlow() ? 1 : 2) : 0;
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
            latentIntervalHandle = Meteor.setInterval(function(){
                var timestamp = Date.now();
                Meteor.call('connectivity.ping', timestamp, function (err, initialTimestamp) {
                    if (err && !_.isUndefined(console)) {
                        console.error(err.message || err.reason);
                    } else {
                        var currentTimestamp = Date.now()
                            , latency = currentTimestamp - initialTimestamp;
                        if (latency > config.maxLatency) {
                            // we've detected a slow connection based on our configured limits
                            self._isSlow.set(true);
                            self._callbacks.onSlowConnection && self._callbacks.onSlowConnection();
                        } else {
                            self._isSlow.set(false);
                        }
                    }
                });
            }, config.retryInterval);
        }
    });  
};