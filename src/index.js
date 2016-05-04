// Module dependencies
var express = require('express')
var request = require('request')

// initialize a local server, listening on default Heroku port or 8080
var server = express()
server.set('port', process.env.PORT || 8080)
server.use(express.static(__dirname))
server.listen(server.get('port'), function () {
  console.log('Express server listening on port ' + server.get('port'))
})

// URL string pointing to the BreweryDB API endpoint querying all Vermont breweries
var brewerydbURL =
`https://api.brewerydb.com/v2/locations?region=Vermont&order=name&sort=ASC&key=${process.env.BREWDB_KEY}&format=json`

var untappdOAuth = {
  client_id: process.env.UNTAPPD_ID,
  client_secret: process.env.UNTAPPD_SECRET
}

console.log('Forwarding API requests')

// listen for any requests made to /brewDB/
// when a request comes through, pipe it to the request function
// make the query to the BreweryDB API, and pipe THAT response back to client
server.all('/brewDB/', function (req, res) {
  console.log('AJAX request made to BreweryDB')
  req.pipe(request(
    {
      url: brewerydbURL,
      method: req.method
    }
)).pipe(res)
})

// These two routes work the same way, but query Untappd for a search or for brewery details
server.all('/untappd/search/', function (req, res) {
  console.log('AJAX request made to Untappd - search for ' + req.query.q)
  req.pipe(request(
    {
      url: 'https://api.untappd.com/v4/search/brewery?client_id=' + untappdOAuth.client_id + '&client_secret=' + untappdOAuth.client_secret,
      qs: req.query,
      method: req.method
    }
  )).pipe(res)
})

server.all('/untappd/brewery/', function (req, res) {
  var url = 'https://api.untappd.com/v4/brewery/info/' + req.query.brewery_id + '?client_id=' + untappdOAuth.client_id + '&client_secret=' + untappdOAuth.client_secret
  req.pipe(request(
    {
      url: url,
      method: req.method
    }
  )).pipe(res)
})
