var $, google, map, ko;

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
	viewModel.infowindow.setOptions({
		content: 'Loading: <i class="fa fa-beer fa-spin"></i>',
		position: brewery.marker.position
	});
	viewModel.infowindow.open(map);
	brewery.marker.setAnimation(google.maps.Animation.BOUNCE);
	// Two calls to Untappd: a search for the brewery, then details for the top result
	// The call goes to /untappd/ which is our Node.js server, which does the actualy query to Untappd API
	$.getJSON('/untappd/search?q=' + brewery.brewery.name, function (search) {
		if (search.response.brewery.items[0] !== undefined) {
			$.getJSON('/untappd/brewery?brewery_id=' + search.response.brewery.items[0].brewery.brewery_id, function (details) {
				var content = '',
					bestRated;
				brewery.untappd = details.response.brewery;
				content += '<img src="' + brewery.untappd.brewery_label + '">';
				content += '<h1>' + brewery.untappd.brewery_name + '</h1>';
				if (brewery.hasOwnProperty('established')) {
					content += '<p> est. ' + brewery.established + '</p>';
				}
				if (brewery.untappd.hasOwnProperty('brewery_description')) {
					content += '<p>' + brewery.untappd.brewery_description + '</p>';
				}
				content += '<p>';
				if (brewery.untappd.contact.url.length > 0) {
					content += '<a href="' + brewery.untappd.contact.url + '" target="_blank">' + brewery.untappd.contact.url + '</a> ';
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
				if (brewery.untappd.beer_list.items.length > 0) {
					content += '</p>';
					content += '<p>Beer enthusiasts on Untappd really like the ';
					bestRated = brewery.untappd.beer_list.items.reduce(function (prev, curr) {
						return (prev.beer.rating_score > curr.beer.rating_score) ? prev : curr;
					});
					content += '<a href="https://untappd.com/beer/' + bestRated.beer.bid + '" target="_blank">' + bestRated.beer.beer_name + '</a>';
				}
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
				content: content
			});
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
		viewModel.brewery().forEach(function (item) {
			item.marker.setVisible(true);
		});
		return viewModel.brewery();
	} else if (!keywords && open2Public) {
		return ko.utils.arrayFilter(viewModel.brewery(), function (item) {
			if (item.openToPublic === 'Y') {
				item.marker.setVisible(true);
				return true;
			} else {
				item.marker.setVisible(false);
				return false;
			}
		});
	} else {
		switch (filter) {
		case 'Name':
			if (open2Public) {
				return ko.utils.arrayFilter(viewModel.brewery(), function (item) {
					if (ko.utils.stringContains(item.brewery.name.toLowerCase(), keywords) && item.openToPublic === 'Y') {
						item.marker.setVisible(true);
						return true;
					} else {
						item.marker.setVisible(false);
						return false;
					}
				});
			} else {
				return ko.utils.arrayFilter(viewModel.brewery(), function (item) {
					if (ko.utils.stringContains(item.brewery.name.toLowerCase(), keywords)) {
						item.marker.setVisible(true);
						return true;
					} else {
						item.marker.setVisible(false);
						return false;
					}
				});
			}

		case 'Location':
			if (open2Public) {
				return ko.utils.arrayFilter(viewModel.brewery(), function (item) {
					if (ko.utils.stringContains(item.locality.toLowerCase(), keywords) && item.openToPublic === 'Y') {
						item.marker.setVisible(true);
						return true;
					} else {
						item.marker.setVisible(false);
						return false;
					}
				});
			} else {
				return ko.utils.arrayFilter(viewModel.brewery(), function (item) {
					if (ko.utils.stringContains(item.locality.toLowerCase(), keywords)) {
						item.marker.setVisible(true);
						return true;
					} else {
						item.marker.setVisible(false);
						return false;
					}
				});
			}
		}
	}
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
		response.data.forEach(function (brewery) {
			var model = brewery;
			model.marker = new google.maps.Marker({
				position: {
					lat: model.latitude,
					lng: model.longitude
				},
				map: map,
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
		window.alert('Oh no. No brewery data available. Please check your connection.');
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

function googleError() {
	'use strict';
	window.alert('Google Maps could not be reached.');
}

// apply bindings
ko.applyBindings(viewModel);

// add click event to slide the menu
var chevron = document.getElementById('chevron');
var sidebar = document.getElementById('sidebar');

function slide() {
	'use strict';
	sidebar.classList.toggle('slide');
	chevron.classList.toggle('spin');

}

chevron.addEventListener('click', slide);
