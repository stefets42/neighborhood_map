// Set global variables
var currentViewModel;

var map;

var defaultIcon;

var selectedIcon;

var largeInfowindow;

// Create the ViewModel 
var ViewModel = function() {
	var self = this;

	// Create an array of restaurants
	self.restaurants = [
		{restaurantName: "Mandoobar", address: "7 rue d'Edimbourg 75008 Paris", location: {lat: 48.8793019, lng: 2.3189615}, filters :["Food"], fsId: "528f41f5498ed26b82536630"},
		{restaurantName: "Bouche à Bouche", address: "5 rue Bourdaloue 75009 Paris", location: {lat: 48.8764377, lng: 2.3361796}, filters :["Food", "Coffee"], fsId: "4b952253f964a520c49034e3"},
		{restaurantName: "Braun Notes Coffee", address: "33 rue de Mogado 75009 Paris", location: {lat: 48.8758014, lng: 2.3288371}, filters: ["Coffee", "Fun"], fsId: "5904805bbfc6d00e185cfd6d"},
		{restaurantName: "ISANA", address: "7 rue Bourdaloue 75009 Paris", location: {lat: 48.8765267, lng: 2.336347}, filters: ["Shopping"], fsId: "58c293ad26a40712f7d1d76f"},
		{restaurantName: "So Nat", address: "5 rue Bourdaloue 75009 Paris", location: {lat: 48.8764377, lng: 2.3361796}, filters: ["Nightlife", "Fun"], fsId: "5810d00e38fa41678dcb1ac5"},
		{restaurantName: "Café Nata", address: "69 rue de Provence 75009 Paris", location: {lat: 48.8742191, lng: 2.3307982}, filters: ["Shopping", "Fun"], fsId: "5098ed04e4b09487f9b4f4ac"},
		{restaurantName: "Milton", address: "46 rue Lamartine 75009 Paris", location: {lat: 48.8767783, lng: 2.3384985}, filters: ["Food"], fsId: "5679984f498e4e9a651bd8ea"},
		{restaurantName: "God Save The Fish", address: "11 rue Buffault (Rue La Fayette) 75009 Paris", location: {lat: 48.875545, lng: 2.3418149}, filters: ["Fun", "Food"], fsId: "53d52982498e546868f57177"}
	];

	// Retrieve Foursquare information for each restaurant
    self.restaurants.forEach(addFoursquare);

	// Create a marker for each restaurant
	self.restaurants.forEach(addMarker);

	// List available filters
	self.availableFilters = ["Food", "Coffee", "Fun", "Nightlife", "Shopping"];

	// Pick selected filters
	self.selectedFilters = ko.observable([]);

	// Filter restaurants according to selected filters
	self.filteredRestaurants = ko.computed(function() {
		var filters = self.selectedFilters();
		if (!filters || filters.length == 0) {
		    var restaurants = self.restaurants;
		} else {
            var restaurants = self.restaurants.filter(function(restaurant) {
                return isIntersected(filters, restaurant.filters);
            });
		}
	    self.restaurants.forEach(function(x) {
	        x.marker.setMap(null);
	    });
        restaurants.forEach(function(x){
            x.marker.setMap(map);
        });
        return restaurants;
	});

	// Add a marker to a restaurant
	function addMarker(x, i) {
	    x.marker = new google.maps.Marker({
	        position: x.location,
	        title: x.restaurantName,
	        animation: google.maps.Animation.DROP,
	        icon: new google.maps.MarkerImage(
	            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|6bc6b0|40|_|%E2%80%A2',
	            new google.maps.Size(21, 34),
	            new google.maps.Point(0, 0),
	            new google.maps.Point(10, 34),
	            new google.maps.Size(21,34)
	        ),
	        id: i
	    });

    	// Display an infovindow when the marker is clicked
	    x.marker.addListener('click', function() {
	        largeInfowindow.marker = this;
	        var rating = x.foursquare.rating;
	        largeInfowindow.setContent("<h3>" + x.restaurantName + "</h3>" +
	                                   "<p> Rating : " + rating + "</p>" +
	                                   "<p>" + currentViewModel.restaurants[this.id].address + "</p>" +
	                                   "<img src=" + x.foursquare.photo + "></img>");
	        largeInfowindow.open(map, this);
	    });

    	// Change icon color and make it bounce when the marker is clicked
	    x.marker.addListener('click', function() {
	    	var self = this;
	    	self.setIcon(selectedIcon);

			function toggleBounce() {
		        if (self.getAnimation() !== null) {
		          self.setAnimation(null);
		        } else {
		          self.setAnimation(google.maps.Animation.BOUNCE);
		            setTimeout(function() {
		                self.setAnimation(null);
		                self.setIcon(defaultIcon);
		            }, 1450);
		        }
		    }
		    toggleBounce();
	    });
	    x.marker.addListener('click', function() {
	        this.setIcon(defaultIcon);
	    });
	}
};

// Function isIntersected to apply filters
function isIntersected(array1, array2) {
    for (var i = 0; i < array1.length; i++) {
        for (var j = 0; j < array2.length; j++) {
            if (array1[i] == array2[j])
                return true;
        }
    }
    return false;
}

// Display information retrieved from Foursquare
function addFoursquare(x, i) {
    var fsBaseUrl = 'https://api.foursquare.com/v2/venues/';
    var fsAuth = '?client_id=ESTMZ1UMKCXYOWX0LX2ZFHT10YZPMYC32ILBBEYJ05M1E0NF' +
                 '&client_secret=NACLDHMSLKFGBLAAODQYAK2KGG3PF3EK5CD5DWTZD3DJKZHE';
    var fsParams = '&v=20170801';

    var foursquareURL = fsBaseUrl + x.fsId + fsAuth + fsParams;
    $.ajax({
        url: foursquareURL,
        success: function(data) {
            var venue = data.response.venue;
            var rating = venue.rating;
            var photo = "https://irs0.4sqi.net/img/general/width150" + venue.bestPhoto.suffix;

			if (rating == undefined)
			  rating = "Rating is not available";
		  
			if (photo == undefined)
			  photo = "Photo is not available";
            
            x.foursquare = {
				rating: rating,
				photo: photo
            }
        },
        error: function(data) {
            alert("An error occured retrieving information from Foursquare");
        }
    })
}

// Display a map centered on Paris Saint-Lazare railway station
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 48.8783009, lng: 2.3294025},
		zoom: 16,
		// Style the map
		styles: [
		  	{
				featureType: "administrative",
	          	elementType: "labels.text",
	          	stylers: [
	            	{
	                	hue: "#48607a"
	              	},
	              	{
	                	saturation: 7
	              	},
	              	{
	                	lightness: 19
	              	},
	              	{
	                	visibility: "on"
	              	}
	          	]
	      	},      
	      	{
	        	featureType: "landscape",
	          	elementType: "all",
	          	stylers: [
	            	{
	                	"hue": "#8194ac"
	              	},
	              	{
	                	"saturation": -100
	              	},
	              	{
	                	"lightness": 77
	              	},
	              	{
	                	"visibility": "simplified"
	              	}
	      		]
	      	},
	      	{
	        	featureType: "poi",
	          	elementType: "all",
	          	stylers: [
	            	{
	                	"hue": "#8194ac"
	              	},
	              	{
	                	"saturation": -100
	              	},
	              	{
	                	"lightness": 33
	              	},
	              	{
	                	"visibility": "simplified"
	              	}
	          	]
			},
	      	{
	        	featureType: "road",
	          	elementType: "geometry",
	          	stylers: [
	            	{
	                	"hue": "#8194ac"
	              	},
	              	{
	                	"saturation": -93
	              	},
	              	{
	                	"lightness": 33
	              	},
	              	{
	                	"visibility": "simplified"
	              	}
	          	]
	      	},
	      	{
	        	featureType: "road",
	          	elementType: "labels",
	          	stylers: [
	            	{
	                	"hue": "#48607a"
	              	},
	              	{
	                	"saturation": -93
	              	},
	              	{
	                	"lightness": 31
	              	},
	              	{
	                	"visibility": "simplified"
	              	}
	          	]
	      	},
	      	{
	        	featureType: "transit",
	          	elementType: "all",
	          	stylers: [
	            	{
	                	"hue": "#8194ac"
	              	},
	              	{
	                	"saturation": 10
	              	},
	              	{
	                	"lightness": 33
	              	},
	              	{
	                	"visibility": "simplified"
	              	}
	          	]
			},
			{
	        	featureType: "water",
	          	elementType: "all",
	          	stylers: [
	            	{
	                	"hue": "#6bc6b0"
	              	},
	              	{
	                	"saturation": -22
	              	},
	              	{
	                	"lightness": 22
	              	},
	              	{
	                	"visibility": "on"
	              	}
	          	]
	      	}
		]
	});

	defaultIcon = new google.maps.MarkerImage(
	    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|e6546e|40|_|%E2%80%A2',
	    new google.maps.Size(21, 34),
	    new google.maps.Point(0, 0),
	    new google.maps.Point(10, 34),
	    new google.maps.Size(21,34)
	);

	selectedIcon = new google.maps.MarkerImage(
	    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|0000ff|40|_|%E2%80%A2',
	    new google.maps.Size(21, 34),
	    new google.maps.Point(0, 0),
	    new google.maps.Point(10, 34),
	    new google.maps.Size(21,34)
	);

	largeInfowindow = new google.maps.InfoWindow();
	largeInfowindow.addListener('closeclick', function() {
	    largeInfowindow.marker = null;
	});

	currentViewModel = new ViewModel();

    // Initial load of markers
    currentViewModel.restaurants.forEach(function(x){
        x.marker.setMap(map);
    });
    
    ko.applyBindings(currentViewModel);
}

// Google Map Request Error Handling
function googleMapError() {
	alert("Google Map Did Not Load Properly");
};