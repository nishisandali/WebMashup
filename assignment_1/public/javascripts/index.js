
//Validating the form 
function validation(formData) {
    let city = document.getElementById("city").value;

    if ( city === '' || city == null){
        alert("Please fill all fields!");
        return false;
    }
    else {
        formData.submit();
        return true;
    }
}


// Getting the value of city name
function inputCity(event){
    let input = event.getElementById('city').value;

    let city = input.value;

    return (city);

}

function initiMap() {
    // The location of selection
    let a = document.getElementById('lat').value;
    let b = document.getElementById('long').value;
    let myLatLng = new google.maps.LatLng(a, b );
    // The map, centered at myLatLang
    let map = new google.maps.Map(
        document.getElementById('map'), {zoom: 4, center: myLatLng,
        });
    // The marker, positioned at myLatLang
    let marker = new google.maps.Marker({position: myLatLng, map: map});

    marker.setMap(map);
}

// Google translate 
function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
}
