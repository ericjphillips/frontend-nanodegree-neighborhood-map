var console, $, google, map, ko;

var viewModel = {
	center: {
		lat: 43.9753,
		lng: -72.5623
	},
	brewery: ko.observableArray(),
	infowindow: {},
	moveInfoWindow: function () {
		'use strict';
		viewModel.infowindow.setOptions({
			content: this.brewery.name,
			position: {
				lat: this.latitude,
				lng: this.longitude
			}
		});
		viewModel.infowindow.open(map);
	}
};

ko.applyBindings(viewModel);

$.ajax({
	type: 'GET',
	dataType: 'json',

	// the client makes a request to the Node.js server, which does the actual request to BreweryDB
	url: '/brewDB/',

	success: function (response) {
		// Here's where you handle a successful response.
		'use strict';
		console.log(response);
		response.data.forEach(function (brewery) {
			brewery.marker = new google.maps.Marker({
				position: {
					lat: brewery.latitude,
					lng: brewery.longitude
				},
				map: map,
				title: brewery.brewery.name
			});
			brewery.marker.addListener('click', viewModel.moveInfoWindow.bind(brewery));
			viewModel.brewery.push(brewery);
		});
	},

	error: function () {
		'use strict';
		console.log('Oh no. No brewery data :-(');
	}
});

//Google Maps callback function
//executes when async response completes
function initMap() {
	'use strict';

	map = new google.maps.Map(document.getElementById('map'), {
		center: viewModel.center,
		zoom: 8
	});

	viewModel.infowindow = new google.maps.InfoWindow({
		content: ''
	});

}
