var console, $, google, map, ko;

var viewModel = {
	center: {
		lat: 43.9753,
		lng: -72.5623
	},
	brewery: ko.observableArray(),
	infowindow: {},
	infoWindowContentConstructor: function (brewery) {
		'use strict';
		var content = '';
		content += '<h1>' + brewery.brewery.name + '</h1>';
		if (brewery.brewery.hasOwnProperty('established')) {
			content += '<p> est. ' + brewery.brewery.established + '</p>';
		}
		if (brewery.hasOwnProperty('website')) {
			content += '<p><a href="' + brewery.website + '">' + brewery.website + '</a></p>';
		}
		if (brewery.brewery.hasOwnProperty('description')) {
			content += '<p>' + brewery.brewery.description + '</p>';
		}
		return content;
	},
	moveInfoWindow: function () {
		'use strict';
		viewModel.infowindow.setOptions({
			content: this.infoWindowContent,
			position: {
				lat: this.latitude,
				lng: this.longitude
			}
		});
		viewModel.infowindow.open(map);
	}
};

ko.applyBindings(viewModel);

//AJAX request to breweryDB
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
			brewery.infoWindowContent = viewModel.infoWindowContentConstructor(brewery);
			brewery.marker.addListener('click', viewModel.moveInfoWindow.bind(brewery));
			viewModel.brewery.push(brewery);
		});
	},

	error: function () {
		'use strict';
		console.log('Oh no. No brewery data available :-(');
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

//practice AJAX calls to untappd
