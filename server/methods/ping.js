Meteor.methods({
	"connectivity.ping": function(timestamp){
		// We don't really care what the arguments are, since this method
		// doesn't have much in the way of security concerns.
		// XXX We should research the possibility of a ddos attack, but I don't
		// think that it's possible for an attacker to redirect the return traffic
		// because Meteor uses DDP, and that's really a job for the rate-limiter package
		check(arguments, [Match.Any]);
		return timestamp;
	}
});
