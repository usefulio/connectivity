var latentIntervalHandle;

Connectivity = {
    _callbacks: {}
    , _config: {}
    , _isSlow: new ReactiveVar(false)
    , _latency: new ReactiveVar(0) 
};

Connectivity.monitor = function(config){
    // set config defaults
    this._config = _.defaults(config || {}, {
        maxLatency: 2000
        , retryInterval: 5000
        , onError: function(error){
            if (! _.isUndefined(console)) {
                console.error(error);
            }
        }
    });
    this._callbacks = _.pick(this._config, 'onError', 'onSlow');
    this._monitor();
};

Connectivity.isSlow = function(){
    return this._isSlow.get();
}

Connectivity.latency = function(){
    return this._latency.get();
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
                        self._callbacks.onError(err.message || err.reason);
                    } else {
                        var currentTimestamp = Date.now()
                            , latency = currentTimestamp - initialTimestamp;
                        self._latency.set(latency);
                        if (latency > self._config.maxLatency) {
                            // we've detected a slow connection based on our configured limits
                            self._isSlow.set(true);
                            self._callbacks.onSlow && self._callbacks.onSlow();
                        } else {
                            self._isSlow.set(false);
                        }
                    }
                });
            }, self._config.retryInterval);
        }
    });  
};