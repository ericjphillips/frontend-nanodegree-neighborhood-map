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

}



//*$.ajax({

// The 'type' property sets the HTTP method.
// A value of 'PUT' or 'DELETE' will trigger a preflight request.
type: 'GET',

	dataType: 'json',

	// The URL to make the request to.
	url: 'https://api.brewerydb.com/v2/locations?region=Vermont&key=47f825b1668bd879c371d39ec0abbcf4&format=json',

	// The 'contentType' property sets the 'Content-Type' header.
	// The JQuery default for this property is
	// 'application/x-www-form-urlencoded; charset=UTF-8', which does not trigger
	// a preflight. If you set this value to anything other than
	// application/x-www-form-urlencoded, multipart/form-data, or text/plain,
	// you will trigger a preflight request.
	contentType: 'text/plain',

	xhrFields: {
		// The 'xhrFields' property sets additional fields on the XMLHttpRequest.
		// This can be used to set the 'withCredentials' property.
		// Set the value to 'true' if you'd like to pass cookies to the server.
		// If this is enabled, your server must respond with the header
		// 'Access-Control-Allow-Credentials: true'.
		withCredentials: true
	},

	headers: {
		// Set any custom headers here.
		// If you set any non-simple headers, your server must include these
		// headers in the 'Access-Control-Allow-Headers' response header.
	},

	success: function (response) {
		// Here's where you handle a successful response.
		'use strict';
		console.log(response);
	},

	error: function () {
		// Here's where you handle an error response.
		// Note that if the error was due to a CORS issue,
		// this function will still fire, but there won't be any additional
		// information about the error.
		'use strict';
	}
}); * //
