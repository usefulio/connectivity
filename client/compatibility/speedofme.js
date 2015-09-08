Meteor.startup(function(){
    // Functions to run after the script tag has loaded
    var onLoad = function(){
        // !_.isUndefined(Connectivity) && Connectivity.init();
    };

    // If the script doesn't load
    var onError = function(error){
        if (! _isUndefined(console)) {
            console.error(error);
        }
    }

    // Generate script tag
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//speedof.me/api/api.js';
    script.onload = onLoad;
    script.onerror = onError;
    script.async = true;

    // Load the script tag
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(script);
});