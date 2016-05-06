var google, map, ko

var viewModel = {
  center:
    {
      lat: 43.9753,
      lng: -72.5623
    },
  brewery: ko.observableArray([]),
  filterby: ko.observable(''),
  open2Public: ko.observable(false),
  keywords: ko.observable(''),
  infowindow: {},
  menuButton: document.getElementById('menuButton'),
  menuArea: document.getElementById('menuArea'),
  toggleMenu: function () {
    this.menuButton.classList.toggle('slide')
    this.menuButton.classList.toggle('spin')
    this.menuArea.classList.toggle('slide')
  }
}

var untappdSearch = new XMLHttpRequest()

// method to move the map's infowindow and update its content.
// takes a brewery as an argument
// closes any open infowindow
// makes a call to Untappd for more detailed information
// assembles infowindow content from available information
// uses the infoWindow setOptions method to change its content and position, then open it on the map
viewModel.infoWindowChange = function (brewery) {
  viewModel.infowindow.close()
  viewModel.infowindow.setOptions(
    {
      content: 'Loading: ...',
      position: brewery.marker.position
    }
  )
  brewery.marker.setAnimation(google.maps.Animation.BOUNCE)
  viewModel.infowindow.open(map)
  untappdSearch.open('GET', '/untappd/?q=' + brewery.brewery.name, true)
  untappdSearch.send()
  untappdSearch.onreadystatechange = function () {
    brewery.untappd = JSON.parse(untappdSearch.responseText).response.brewery
    var content = ''
    var bestRated
    content += '<img src="' + brewery.untappd.brewery_label + '">'
    content += '<h1>' + brewery.untappd.brewery_name + '</h1>'
    if (brewery.hasOwnProperty('established')) {
      content += '<p> est. ' + brewery.established + '</p>'
    }
    if (brewery.untappd.hasOwnProperty('brewery_description')) {
      content += '<p>' + brewery.untappd.brewery_description + '</p>'
    }
    content += '<p>'
    if (brewery.untappd.contact.url.length > 0) {
      content += '<a href="' + brewery.untappd.contact.url + '" target="_blank">' + brewery.untappd.contact.url + '</a> '
    }
    if (brewery.untappd.contact.facebook.length > 0) {
      content += '<a href="' + brewery.untappd.contact.facebook + '" target="_blank">Facebook</a> '
    }
    if (brewery.untappd.contact.instagram.length > 0) {
      content += '<a href="https://www.instagram.com/' + brewery.untappd.contact.instagram + '" target="_blank">Instagram</a> '
    }
    if (brewery.untappd.contact.twitter.length > 0) {
      content += '<a href="https://twitter.com/' + brewery.untappd.contact.twitter + '" target="_blank">Twitter</a>'
    }
    if (brewery.untappd.beer_list.items.length > 0) {
      content += '</p>'
      content += '<p>Beer enthusiasts on Untappd really like the '
      bestRated = brewery.untappd.beer_list.items.reduce(function (prev, curr) {
        return (prev.beer.rating_score > curr.beer.rating_score) ? prev : curr
      })
      content += '<a href="https://untappd.com/beer/' + bestRated.beer.bid + '" target="_blank">' + bestRated.beer.beer_name + '</a>'
    }
    viewModel.infowindow.setOptions(
      {
        content: content
      }
    )
    brewery.marker.setAnimation(null)
  }
}

// This utility function doesn't ship with the minified version of Knockout!
// Search a string for a substring, return true if found
// Thank you Google user 'rpn' for defining a similar function
ko.utils.stringContains = function (string, substring) {
  'use strict'
  string = string || ''
  if (substring.length > string.length) {
    return false
  }
  return string.indexOf(substring) > -1
}

// A method to filter the list view
// Looks for user text or checkbox, then filters the array appropriately
viewModel.listView = ko.computed(function () {
  'use strict'
  var open2Public = viewModel.open2Public()
  var keywords = viewModel.keywords().toLowerCase()
  var filter = viewModel.filterby()
  return ko.utils.arrayFilter(viewModel.brewery(), function (item) {
    var check = filter === 'Name' ? item.brewery.name : item.locality
    if (ko.utils.stringContains(check.toLowerCase(), keywords) && (!open2Public || item.openToPublic === 'Y')) {
      item.marker.setVisible(true)
      return true
    } else {
      item.marker.setVisible(false)
      return false
    }
  })
})

// AJAX request to BreweryDB for all breweries in the state of Vermont
var breweriesRequest = new XMLHttpRequest()

breweriesRequest.open('GET', '/brewerydb/', true)
breweriesRequest.onreadystatechange = function () {
  var brewModel = JSON.parse(breweriesRequest.responseText).data
  brewModel.forEach(function (brewery) {
    var model = brewery
    model.marker = new google.maps.Marker(
      {
        position:
        {
          lat: model.latitude,
          lng: model.longitude
        },
        map: map,
        title: model.brewery.name
      }
    )
    model.marker.addListener('click', function () {
      viewModel.infoWindowChange(model)
    })
    viewModel.brewery.push(model)
    if (brewModel.indexOf(brewery) === brewModel.length - 1) {
      viewModel.brewery.sort(function (left, right) {
        return left.brewery.name === right.brewery.name ? 0 : (left.brewery.name < right.brewery.name ? -1 : 1)
      })
    }
  })
}

// Google Maps callback function
// Executes when async response completes
function initMap () {
  map = new google.maps.Map(document.getElementById('map'), {
    center: viewModel.center,
    zoom: 8
  })

  viewModel.infowindow = new google.maps.InfoWindow(
    {
      content: '',
      pixelOffset: new google.maps.Size(0, -30)
    }
  )
  breweriesRequest.send()
}
// todo (add more graceful error handling)
function googleError () {
  'use strict'
  window.alert('Google Maps could not be reached.')
}

// apply bindings
ko.applyBindings(viewModel)
