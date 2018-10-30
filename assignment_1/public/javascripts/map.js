let map, places;
let city;
let countryRestrict = {'country': 'au'};

let countries = {
    'au': {
        center: {lat: -25.3, lng: 133.8},
    },
    'br': {
        center: {lat: -14.2, lng: -51.9},
    },
    'ca': {
        center: {lat: 62, lng: -110.0},
    },
    'nz': {
        center: {lat: -40.9, lng: 174.9},
    },
    'it': {
        center: {lat: 41.9, lng: 12.6},
    },
    'pt': {
        center: {lat: 39.4, lng: -8.2},
    },
    'us': {
        center: {lat: 37.1, lng: -95.7},
    },
    'uk': {
        center: {lat: 54.8, lng: -4.6},
    },
    'chi': {
        center: {lat: -35.6, lng: -71.5},
    },
    'ind': {
        center: {lat: 20.5, lng: 78.9},
    },
    'sri': {
        center: {lat: 7.8, lng: 80.7},
    },
    'qtr': {
        center: {lat: 25.2, lng: 51.3},
    },
    'uae': {
        center: {lat: 23.4, lng: 53.8},
    }
};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: countries['au'].center,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false
    });

    // Create the city object and associate it with the UI input control.
    // Restrict the search to the default country, and to place type "cities".
    city = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */ (
            document.getElementById('city')), {
            types: ['(cities)'],
            componentRestrictions: countryRestrict
        });
    places = new google.maps.places.PlacesService(map);

    city.addListener('place_changed', onPlaceChanged);

    // Add a DOM event listener to react when the user selects a country.
    document.getElementById('country').addEventListener(
        'change', setAutocompleteCountry);
}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
    let place = city.getPlace();
    if (place.geometry) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
        search();
    } else {
        document.getElementById('city').placeholder = 'Enter a city';
    }
}


// Set the country restriction based on user input.
// Also center and zoom the map on the given country.
function setAutocompleteCountry() {
    let country = document.getElementById('country').value;
    if (country === 'all') {
        city.setComponentRestrictions({'country': []});
        map.setCenter({lat: 15, lng: 0});
        map.setZoom(2);
    } else {
        city.setComponentRestrictions({'country': country});
        map.setCenter(countries[country].center);
        map.setZoom(countries[country].zoom);
    }
}