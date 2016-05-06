// Module dependencies
var express = require('express')
var request = require('request')

// initialize a server, listening on default Heroku port or 8080
var server = express()
server.set('port', process.env.PORT || 8080)
server.use(express.static(__dirname))
server.listen(server.get('port'), function () {
  console.log('Express server listening on port ' + server.get('port'))
})

// URL string pointing to the BreweryDB API endpoint querying all Vermont breweries
var brewerydbURL =
`https://api.brewerydb.com/v2/locations?region=Vermont&order=name&sort=ASC&key=${process.env.BREWDB_KEY}&format=json`

var untappdURL = 'https://api.untappd.com/v4'
var untappdOAuth = {
  client_id: process.env.UNTAPPD_ID,
  client_secret: process.env.UNTAPPD_SECRET
}

console.log('Forwarding API requests')

function getAllVtBreweries () {
  return new Promise(function (resolve, reject) {
    request.get(brewerydbURL, (error, response, body) => {
      resolve(body)
    })
  })
}

server.all('/brewerydb/', function (req, res) {
  getAllVtBreweries().then(model => res.send(model))
})

server.all('/untappd/', function (req, res) {
  console.log('AJAX request made to Untappd - search for ' + req.query.q)
  searchBreweryByName(req.query.q)
  .then(id => searchBreweryById(id))
  .then(details =>
    res.send(details))
})

function searchBreweryByName (query) {
  return new Promise(function (resolve, reject) {
    request.get(`${untappdURL}/search/brewery?client_id=${untappdOAuth.client_id}&client_secret=${untappdOAuth.client_secret}&q=${query}`, function (error, response, body) {
      var data = JSON.parse(body)
      if (data.response.brewery.items[0]) {
        resolve(data.response.brewery.items[0].brewery.brewery_id)
      } else {
        reject('No Untappd information available for that brewery')
      }
    })
  })
}

function searchBreweryById (id) {
  return new Promise(function (resolve, reject) {
    request.get(`${untappdURL}/brewery/info/${id}?client_id=${untappdOAuth.client_id}&client_secret=${untappdOAuth.client_secret}`, function (error, response, body) {
      resolve(body)
    })
  })
}
