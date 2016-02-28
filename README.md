# Vermont Breweries: An Interactive Map
This is a single page application integrating information from Google Maps and two third-party APIs. A list of breweries in the state of Vermont is retrieved from [BreweryDB](http://www.brewerydb.com/), which are then added to a map. A list view and filter are provided. Info windows on the map provide detailed information from [Untappd](https://untappd.com/) on selected breweries.

## Getting Started
### Required Software
Using this app requires [Node.js](https://nodejs.org/en/). We will be running our own local server to serve the page and to make requests to BreweryDB.
### Installation
Clone the repository from Github:

`$ git clone https://github.com/ericjphillips/frontend-nanodegree-neighborhood-map.git`

From the project directory, install the required Node packages:

`$ npm install`
### Starting the Server
To start the server with its default settings:

`$ node index.js`

This will create a local server on port 8080.
### Loading the Application
In your browser's address bar, enter `localhost:8080` to access our local server.
