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
var brewerydbURL = 'https://api.brewerydb.com/v2/locations?region=Vermont&order=name&sort=ASC&key=47f825b1668bd879c371d39ec0abbcf4&format=json'

var untappdOAuth = {
  client_id: '33F245D792EDB200715AC09193096EE41450F51F',
  client_secret: 'EE12D87862B5FA959C68C57B362CE9724A828DFC'
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
