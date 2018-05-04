var map;

 // list of locations
var locations = [
    {
           title: 'Phoronic Valliage',
           location: {lat: 29.998365, lng: 31.215206},
           venueID:'4d2adbd8068e8cfa2a68dd4c'
         },
          {
           title: 'Coptic Museum',
           location: {lat: 30.006291, lng: 31.230667},
           venueID:'4be957d59a54a5931aee0a11'
         },
          {
           title: 'Ben Ezra Synagogue',
           location: {lat: 30.005872, lng: 31.231042},
           venueID:'4cc8310cf2d437044153cd6c'
         },
          {
           title: 'St Sergius and St Bacchus Church',
           location: {lat: 30.006346, lng: 31.230667},
           venueID:'4cc82fb15b7aa1430ccf337d'
         },
          {
            title: 'The Hanging Church', 
            location: {lat: 30.007136, lng: 31.230098},
            venueID:'4e745b01aeb780be09b8bc9f'

          } 
];


// Google Maps
function mapView() {
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 30.007136, lng:31.230667},
    });
}


// Handling map error
function mapFailed() {
    alert('Google Maps failed to load load. Please check your internet connection and try again later.');
}

var Location = function(data) {
    this.title = data.title;
    this.location = data.location;
    this.venueID = data.venueID;
    this.marker = null;
};

var ViewModel = function() {

    var self = this;
    var infowindow = new google.maps.InfoWindow({
        maxWidth: 350,
    });

    self.places = [];

    locations.forEach(function(locationItem) {    
        self.places.push(new Location(locationItem));
    });

    // Making markers for locaqtions
    self.places.forEach(function(locationItem) {
        
        locationItem.marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            position: locationItem.location,
        });

        // Getting place info fromFourSquare
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + locationItem.venueID +'?client_id=RQ0LWASE12UGXRSULPTZKJTDHJMR12OLEBQRD23NY0VVFDWJ&client_secret=FZGA2U4ZY0TRDSS5EWJL1O3AXM3LMEXDY5EW3KZ0HDBKPQHP&v=20180223',
            dataType: "json"
        }).done(function (data) {

            // helpers: shortener and confirm valid json responses
            var venueDetails = data.response.venue;

            var description = venueDetails.hasOwnProperty("description") ? venueDetails.description : "No description available";

            var openingHours = venueDetails.hasOwnProperty("hours") ? venueDetails.hours.status : "No info available";

            var address = venueDetails.location.hasOwnProperty("formattedAddress") ? venueDetails.location.formattedAddress : "No info available";

            var rating = venueDetails.hasOwnProperty("rating") ? venueDetails.rating  : "No rating available";


            // info in the showinfo window
            locationItem.contentString = '<div class="infowindow">' +
                '<div>' +
                    '<h2>' + locationItem.title+ '</h2>' +
                    '<p>Opening hours: ' + openingHours + '</p>' +
                    '<p>' + description + '</p>' +
                    '<p>Location: ' + address + '</p>' +
                    '<p>Rating: ' + rating + '</p>' +
                '</div>' +  
                '</div>'; 

            locationItem.infowindow = new google.maps.InfoWindow({
                content: locationItem.contentString
            });

        // Foursquare error
        }).fail(function() {
            document.getElementById('foursquare-loading-error').innerHTML = 'Failed to get information from Foursquare.';
        });

        
        google.maps.event.addListener(locationItem.marker, 'click', function() {
            bounceMarker(this);
            infowindow.open(map, locationItem.marker);
            infowindow.setContent(locationItem.contentString);
        });


    });

    this.showInfo = function(locationItem) {
        var marker = locationItem.marker;
        bounceMarker(marker);
        infowindow.open(map, locationItem.marker);
        infowindow.setContent(locationItem.contentString);
    };

    function bounceMarker(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2100);  
        }
    }

    // search and filter data

    
    self.filteredLocations = ko.observableArray();

    self.places.forEach(function(locationItem) {
        self.filteredLocations.push(locationItem);
    });

    
    self.filter = ko.observable('');

    self.locationsFilter = function() {
        var searchFilter = self.filter().toLowerCase();
        self.filteredLocations.removeAll();
        self.places.forEach(function(locationItem) {
            locationItem.marker.setVisible(false);
            if(locationItem.title.toLowerCase().indexOf(searchFilter) !== -1) {
                self.filteredLocations.push(locationItem);
            }
        });
        self.filteredLocations().forEach(function(locationItem) {
            locationItem.marker.setVisible(true);
        });
    };

   
};

var initMap = function() {
    mapView();
    ko.applyBindings(new ViewModel());
};
