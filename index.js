//Module dependencies
var express = require('express');
var httpProxy = require('http-proxy');

var server = express();

server.set('port', 8080);

server.use(express.static(__dirname));

server.listen(server.get('port'), function () {
	'use strict';
	console.log('Express server listening on port ' + server.get('port'));
});

var apiForwardingUrl = 'https://api.brewerydb.com/v2/locations?region=Vermont&key=47f825b1668bd879c371d39ec0abbcf4&format=json';

var apiProxy = httpProxy.createProxyServer({
	changeOrigin: true
});

console.log('Forwarding API requests to ' + apiForwardingUrl);

server.all('/brewDB/*', function (req, res) {
	'use strict';
	console.log("Request made to /brewDB/");
	apiProxy.web(req, res, {
		target: apiForwardingUrl
	});
});
