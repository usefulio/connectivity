var config
    , latentIntervalHandle
    , heartbeatIntervalHandle = null;

Connectivity = {
    _initialized: false
    , _callbacks: {}
    , isSlow: new ReactiveVar(false)
    , latency: new ReactiveVar(0)
};

Connectivity.init = function () {
    var success = this._initialized;
    // check a flag to see if the user wants to monitor yet
    // and check to see if the SpeedOfMe API has loaded yet.
    if (! success && ! _.isUndefined(SomApi)) {
        this._initialized = true;

        // do what we were asked to do if we were asked to do something
        config = _.defaults(Meteor.settings.public.connectivity, {
            maxLatency: 10000 // milliseconds
        });

        var speedOfMe = _.defaults(config.speedOfMe || {}, {
            account: null
            , domainName: null
        });

        if (! speedOfMe.account) {
            console.warn("Please provide 'account' option!");
        } else if (! speedOfMe.domainName) {
            console.warn("Please provide 'domainName' option!");
        }

        // Configure SomApi
        SomApi.account      = speedOfMe.account;
        SomApi.domainName   = speedOfMe.domainName;

        _.extend(SomApi.config, {
            // our default SpeedOfMe configurations
            sustainTime: 1
            // XXX the progress sub-object has the potential to be 
            // inadvertently overwritten by the app developer
            // if they omit one of the progress properties
        }, speedOfMe.config);

        SomApi.onTestCompleted  = this._callbacks.onTestCompleted;
        SomApi.onError          = this._callbacks.onError;

        success = true;
    }
    return success;
};

Connectivity.monitor = function(callbacks){
    this._callbacks = _.extend({
        onError: function(error){
            if (! _.isUndefined(console)) {
                console.error(error);
            }
        }
    }, callbacks);

    if (this.init()) {
        this._monitor();
    }
};

Connectivity.speedTest = function(onTestCompleted, onError){
    if (this.init()) {
        SomApi.onTestCompleted  = onTestCompleted || this._callbacks.onTestCompleted;
        SomApi.onError          = onError || this._callbacks.onError;

        if (! SomApi.onTestCompleted) {
            console.warn("onTestCompleted callback needs to be defined!");
        }

        SomApi. startTest();
    }
}

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
            if (Meteor.connection._heartbeat) {
                // Calculate the threshold for considering a connection slow using the heartbeat roundtrip duration and the maxLatency
                var interval = Meteor.connection._heartbeat.heartbeatTimeout * 2 + config.maxLatency;
                latentIntervalHandle = Meteor.setInterval(function(){
                    if (Meteor.connection._heartbeat._heartbeatIntervalHandle === heartbeatIntervalHandle) {
                        // we've detected a slow connection based on our configured limits
                        if (config.runSpeedTestOnSlowConnection) {
                            self.speedTest();
                        }
                        self._callbacks.onSlowConnection && self._callbacks.onSlowConnection();
                    } else {
                        heartbeatIntervalHandle = Meteor.connection._heartbeat._heartbeatIntervalHandle;
                    }
                }, interval);
            }
        }
    });  
};