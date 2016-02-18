var console, $, google, map, service, ko;

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
			content: '',
			position: ''
		});
		viewModel.infowindow.open(map);
	}
};

ko.applyBindings(viewModel);

//Google Maps callback function
//executes when async response completes
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

}

$.ajax({
	type: 'GET',
	dataType: 'json',

	// the client makes a request to the Node.js server, which does the actual request to BreweryDB
	url: '/brewDB/',

	success: function (response) {
		// Here's where you handle a successful response.
		'use strict';
		console.log(response);
	},

	error: function () {
		'use strict';
		console.log('Oh no. No brewery data :-(');
	}
});
