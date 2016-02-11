var map;

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