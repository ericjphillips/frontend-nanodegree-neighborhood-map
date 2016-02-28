var console, $, google, map, ko;

var viewModel = {
	center: {
		lat: 43.9753,
		lng: -72.5623
	},
	brewery: ko.observableArray([]),
	filterby: ko.observable(''),
	open2Public: ko.observable(false),
	keywords: ko.observable(''),
	infowindow: {}
};

// method to move the map's infowindow and update its content.
// takes a brewery as an argument
// closes any open infowindow
// makes a call to Untappd for more detailed information
// assembles infowindow content from available information
// uses the infoWindow setOptions method to change its content and position, then open it on the map
viewModel.infoWindowChange = function (brewery) {
	'use strict';
	viewModel.infowindow.close();
	brewery.marker.setAnimation(google.maps.Animation.BOUNCE);
	//Two calls to Untappd: a search for the brewery, then details for the top result
	$.getJSON('/untappd/search?q=' + brewery.brewery.name, function (search) {
		if (search.response.brewery.items[0] !== undefined) {
			$.getJSON('/untappd/brewery?brewery_id=' + search.response.brewery.items[0].brewery.brewery_id, function (details) {
				console.log(details);
				var content = '';
				brewery.untappd = details.response.brewery;
				content += '<img src="' + brewery.untappd.brewery_label + '">';
				content += '<h1>' + brewery.brewery.name + '</h1>';
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
				brewery.marker.setAnimation(null);

			});
		} else {
			var content = '';
			content += '<h1>' + brewery.brewery.name + '</h1>';
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
			brewery.marker.setAnimation(null);
		}
	});
};

// This utility function doesn't ship with the minified version of Knockout!
// Search a string for a substring, return true if found
// Thank you Google user 'rpn' for defining a similar function
ko.utils.stringContains = function (string, substring) {
	'use strict';
	string = string || "";
	if (substring.length > string.length) {
		return false;
	}
	return string.indexOf(substring) > -1;
};

// A method to filter the list view
// Looks for user text or checkbox, then filters the array appropriately
viewModel.listView = ko.computed(function () {
	'use strict';
	var open2Public = viewModel.open2Public(),
		keywords = viewModel.keywords().toLowerCase(),
		filter = viewModel.filterby();
	if (!keywords && !open2Public) {
		return viewModel.brewery();
	} else if (!keywords && open2Public) {
		return ko.utils.arrayFilter(viewModel.brewery(), function (item) {
			return item.openToPublic === 'Y';
		});
	} else {
		switch (filter) {
		case 'Name':
			if (open2Public) {
				return ko.utils.arrayFilter(viewModel.brewery(), function (item) {
					return ko.utils.stringContains(item.brewery.name.toLowerCase(), keywords) && item.openToPublic === 'Y';
				});
			} else {
				return ko.utils.arrayFilter(viewModel.brewery(), function (item) {
					return ko.utils.stringContains(item.brewery.name.toLowerCase(), keywords);
				});
			}

		case 'Location':
			if (open2Public) {
				return ko.utils.arrayFilter(viewModel.brewery(), function (item) {
					return ko.utils.stringContains(item.locality.toLowerCase(), keywords) && item.openToPublic === 'Y';
				});
			} else {
				return ko.utils.arrayFilter(viewModel.brewery(), function (item) {
					return ko.utils.stringContains(item.locality.toLowerCase(), keywords);
				});
			}
		}
	}
});

// A method to sync the map and list view.
// Loops through list view, if a brewery is on the map and in the list its marker is set on the map
viewModel.visibleMarkers = ko.computed(function () {
	'use strict';
	var model = viewModel.brewery(),
		listView = viewModel.listView();
	model.forEach(function (brewery) {
		if (listView.indexOf(brewery) !== -1) {
			brewery.marker.setMap(map);
		} else {
			brewery.marker.setMap(null);
		}
	});
});

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
		// Checks if that was the last brewery in the array, and if so performs a sort by name on the viewModel data.
		'use strict';
		console.log(response);
		response.data.forEach(function (brewery) {
			var model = brewery;
			model.marker = new google.maps.Marker({
				position: {
					lat: model.latitude,
					lng: model.longitude
				},
				map: null,
				title: model.brewery.name
			});
			model.marker.addListener('click', function () {
				viewModel.infoWindowChange(model);
			});
			viewModel.brewery.push(model);
			if (response.data.indexOf(brewery) === response.data.length - 1) {
				viewModel.brewery.sort(function (left, right) {
					return left.brewery.name === right.brewery.name ? 0 : (left.brewery.name < right.brewery.name ? -1 : 1);
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
var chevron = document.getElementById('chevron');
var sidebar = document.getElementById('sidebar');

function slide() {
	'use strict';
	sidebar.classList.toggle('slide');
	chevron.classList.toggle('spin');

}

chevron.addEventListener('click', slide);
