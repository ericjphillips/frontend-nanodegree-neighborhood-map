var console, $, google, map, ko;

var viewModel = {
	center: {
		lat: 43.9753,
		lng: -72.5623
	},
	brewery: ko.observableArray(),
	infowindow: {}
};

// method to move the map's infowindow and update its content.
// takes a brewery as an argument
// makes a call to Untappd for more detailed information
// assembles infowindow content from available information
// uses the infoWindow setOptions method to change its content and position, then open it on the map
viewModel.infoWindowChange = function (brewery) {
	'use strict';
	//Two calls to Untappd: a search for the brewery, then details for the top result
	$.getJSON('/untappd/search?q=' + brewery.name, function (search) {
		if (search.response.brewery.items[0] !== undefined) {
			$.getJSON('/untappd/brewery?brewery_id=' + search.response.brewery.items[0].brewery.brewery_id, function (details) {
				console.log(details);
				var content = '';
				brewery.untappd = details.response.brewery;
				content += '<img src="' + brewery.untappd.brewery_label + '">';
				content += '<h1>' + brewery.name + '</h1>';
				if (brewery.hasOwnProperty('established')) {
					content += '<p> est. ' + brewery.established + '</p>';
				}
				if (brewery.hasOwnProperty('description')) {
					content += '<p>' + brewery.description + '</p>';
				}
				content += '<p>';
				if (brewery.hasOwnProperty('website')) {
					content += '<a href="' + brewery.website + '" target="_blank">' + brewery.website + '</a> ';
				}
				if (brewery.untappd.contact.facebook.length > 0) {
					content += '<a href="' + brewery.untappd.contact.facebook + '" target="_blank"><i class="fa fa-facebook-official"></i></a> ';
				}
				if (brewery.untappd.contact.instagram.length > 0) {
					content += '<a href="https://www.instagram.com/' + brewery.untappd.contact.instagram + '" target="_blank"><i class="fa fa-instagram"></i></a> ';
				}
				if (brewery.untappd.contact.twitter.length > 0) {
					content += '<a href="https://twitter.com/' + brewery.untappd.contact.twitter + '" target="_blank"><i class="fa fa-twitter"></i></a>';
				}
				content += '</p>';
				viewModel.infowindow.setOptions({
					content: content,
					position: brewery.marker.position
				});
				viewModel.infowindow.open(map);
			});
		} else {
			var content = '';
			content += '<h1>' + brewery.name + '</h1>';
			if (brewery.hasOwnProperty('established')) {
				content += '<p> est. ' + brewery.established + '</p>';
			}
			if (brewery.hasOwnProperty('website')) {
				content += '<p><a href="' + brewery.website + '">' + brewery.website + '</a></p>';
			}
			if (brewery.hasOwnProperty('description')) {
				content += '<p>' + brewery.description + '</p>';
			}
			viewModel.infowindow.setOptions({
				content: content,
				position: brewery.marker.position
			});
			viewModel.infowindow.open(map);
		}
	});
};

// AJAX request to BreweryDB for all breweries in the state of Vermont
$.ajax({
	type: 'GET',
	dataType: 'json',

	// the client makes a request to the Node.js server, which does the actual request to BreweryDB
	url: '/brewDB/',

	success: function (response) {
		// Here's where we handle a successful response.
		// Iterates through the response and builds a model object for each brewery.
		// Adds a Google Maps marker with event listener to each.
		// Pushes the model to the viewModel observable array.
		// Checks if that was the last brewery in the array, and if so performs a sort on the viewModel data.
		'use strict';
		console.log(response);
		response.data.forEach(function (brewery) {
			var model = brewery.brewery;
			model.marker = new google.maps.Marker({
				position: {
					lat: brewery.latitude,
					lng: brewery.longitude
				},
				map: map,
				title: brewery.name
			});
			model.marker.addListener('click', function () {
				viewModel.infoWindowChange(model);
			});
			viewModel.brewery.push(model);
			if (response.data.indexOf(brewery) === response.data.length - 1) {
				viewModel.brewery.sort(function (left, right) {
					return left.name === right.name ? 0 : (left.name < right.name ? -1 : 1);
				});
			}
		});
	},

	error: function () {
		'use strict';
		console.log('Oh no. No brewery data available :-(');
	}
});

// Google Maps callback function
// Executes when async response completes
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

// apply bindings
ko.applyBindings(viewModel);
