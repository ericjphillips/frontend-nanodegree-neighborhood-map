//Module dependencies
var express = require('express');
var request = require('request')

//initialize a local server on project directory, listening on port 8080
var server = express();
server.set('port', 8080);
server.use(express.static(__dirname));
server.listen(server.get('port'), function () {
	'use strict';
	console.log('Express server listening on port ' + server.get('port'));
});

//URL string pointing to the BreweryDB API, querying for all Vermont breweries
var brewerydbURL = 'https://api.brewerydb.com/v2/locations?region=Vermont&key=47f825b1668bd879c371d39ec0abbcf4&format=json';

console.log('Forwarding API requests');

//listen for any requests made to /brewDB/
//when a request comes through, pipe it to the request function
//make the query to the BreweryDB API, and pipe response back to client
server.all('/brewDB/*', function (req, res) {
	'use strict';
	console.log("AJAX request made to brewDB");
	req.pipe(request({
		url: brewerydbURL,
		qs: req.query,
		method: req.method
	})).pipe(res);
});
