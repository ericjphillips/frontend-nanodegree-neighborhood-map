var google;
var map;

var model = {
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
     map = new google.maps.Map(document.getElementById('map'), {
          center: {
               lat: 45,
               lng: -71.6711963
          },
          zoom: 10
     });
}