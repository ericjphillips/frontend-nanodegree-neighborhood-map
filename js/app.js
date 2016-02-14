var google;
var geocoder;
var map;

var model = {center: {lat: 44.2035, lng: -72.5623}};

function initMap() {
	'use strict';
	map = new google.maps.Map(document.getElementById('map'), {
		center: model.center,
		zoom: 8
	});
}

/*
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
*/
