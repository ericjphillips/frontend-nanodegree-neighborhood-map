var google, map, service, ko;

var viewModel = {
	center: {
		lat: 44.2035,
		lng: -72.5623
	},
	brewery: ko.observableArray(),
	infowindow: {},
	moveInfoWindow: function () {
		'use strict';
		viewModel.infowindow.setOptions({
			content: this.name,
			position: this.geometry.location
		});
		viewModel.infowindow.open(map);
	}
};

ko.applyBindings(viewModel);

//Google Maps callback function
//Executes when async response completes
function initMap() {
	'use strict';

	map = new google.maps.Map(document.getElementById('map'), {
		center: viewModel.center,
		zoom: 8
	});

	service = new google.maps.places.PlacesService(map);

	viewModel.infowindow = new google.maps.InfoWindow({
		content: ''
	});

	function detailedCallback(place, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			if (place.address_components[3].short_name === 'VT') {
				place.marker = new google.maps.Marker({
					position: place.geometry.location,
					map: map,
					title: place.name
				});
				place.marker.addListener('click', viewModel.moveInfoWindow.bind(place));
				viewModel.brewery.push(place);
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
		google.maps.event.clearListeners(map, 'idle');
	}

	map.addListener('idle', loadBreweries);
}
