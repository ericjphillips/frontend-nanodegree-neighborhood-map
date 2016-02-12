var google;
var geocoder;
var map;

var model = {
     center: {lat: 44.2035, lng: -72.5623},
     localBusiness: [{
          'name': 'Buck Rub Pub',
          'address': '2253 North Main Street, Pittsburg, NH',
          'type': 'Restaurant'
     }, {
          'name': 'Dancing Bear Pub',
          'address': '151 Main Street, Colebrook, NH',
          'type': 'Restaurant'
     }, {
          'name': 'Spa Restaurant & Outback Pub',
          'address': '869 Washington Street, West Stewartstown, NH',
          'type': 'Restaurant'
     }, {
          'name': 'Timeout Tavern Sports Bar / Northland Restaurant',
          'address': '114 Gale Street, Canaan, VT',
          'type': 'Restaurant'
     }, {
          'name': 'Bear Rock Adventures',
          'address': '545 Beach Road, Pittsburg, NH',
          'type': 'Recreation'
     }, {
          'name': 'Let\'s Ride Rentals',
          'address': '978 Diamond Pond Road, Stewartstown, NH',
          'type': 'Recreation'
     }
          ]
};

function initMap() {
     'use strict';
     geocoder = new google.maps.Geocoder();
     map = new google.maps.Map(document.getElementById('map'), {
          center: model.center,
          zoom: 8
     });
}

function callback(results, status) {
     'use strict';
     if (status === google.maps.places.PlacesServiceStatus.OK) {
          model.breweries = results;
     }
}

function loadBreweries() {
     'use strict';
     var service, request;
     service = new google.maps.places.PlacesService(map);
     request = {
          bounds: map.getBounds(),
          keyword: 'Vermont brewery'
     };
     service.radarSearch(request, callback);
}

function codeAddresses() {
     'use strict';
     model.localBusiness.forEach(function (business) {
          business.geocode = {};
          geocoder.geocode({'address': business.address}, function (results, status) {
               if (status === google.maps.GeocoderStatus.OK) {
                    business.geocode.lat = results[0].geometry.location.lat();
                    business.geocode.lng = results[0].geometry.location.lng();
               } else {
                    business.geocode = false;
               }
          });
     });
}

function addMarkers() {
     'use strict';
     model.localBusiness.forEach(function (business) {
          business.marker = new google.maps.Marker({
               position: business.geocode,
               map: map,
               title: business.name
          });
     });
}
