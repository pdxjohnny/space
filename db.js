var stats_database = 'space';
var ships_database = 'spaceships';

var db = {};
db[ stats_database ] = new PouchDB( stats_database, {adapter: 'websql'});
db[ ships_database ] = new PouchDB( ships_database, {adapter: 'websql'});

var options = { live: true };

for ( database in db )
{
	if ( !db[ database ].adapter )
	{
		db[ database ] = new PouchDB( database );
	}
	var remoteCouch = "http://couch.carpoolme.net/" + stats_database;
	// var remoteCouch = location.origin + ':5984/' + stats_database;
	// var remoteCouch = 'http://carpoolme.net' + ':5984/' + database;
	// var remoteCouch = 'http://192.168.1.29' + ':5984/' + database;
	db[ database ].replicate.to( remoteCouch, options );
	db[ database ].replicate.from( remoteCouch, options );
}