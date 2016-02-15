var google, map, service;

var model = {
	center: {
		lat: 44.2035,
		lng: -72.5623
	},
	breweries: []
};

function initMap() {
	'use strict';

	map = new google.maps.Map(document.getElementById('map'), {
		center: model.center,
		zoom: 8
	});

	service = new google.maps.places.PlacesService(map);

	function detailedCallback(place, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			if (place.address_components[3].short_name === 'VT') {
				model.breweries.push(place);
				var marker = new google.maps.Marker({
					position: place.geometry.location,
					map: map,
					title: place.name
				});
			}
		}
	}

	function callback(results, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			results.forEach(function (place) {
				service.getDetails(place, detailedCallback);
			});
		}
	}

	function loadBreweries() {
		var request = {
			bounds: map.getBounds(),
			keyword: 'brewery'
		};
		service.radarSearch(request, callback);
	}

	map.addListener('idle', loadBreweries);
}
