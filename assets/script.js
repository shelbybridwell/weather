//const api = '225569ec657be8e17ac296ced3863d8d';
var API_KEY = "225569ec657be8e17ac296ced3863d8d";

// -- On load --
$(document).ready(function(){
    // If geolocation is not supported, hide the geolocaion icon
    if (!navigator.geolocation){
        $('#geolocation').hide();
    }
    // Get default city
    var city;
    if (document.location.hash){
        // Get city from hash
        city = document.location.hash.substr(1);
    }
    else {
        // Default city
        city = "Nashville,";
    }
    // Get and display current date
    date = moment();
    for (var i = 0; i < 6; i++){
        // Display date
        day = $("#meteo-day-" + (i+1));
        day.find(".name").text(date.format("dddd"));
        day.find(".date").text(date.format("MM/DD"));
        // Go to the next day
        date = date.add(1, 'days')
    }
    // Loading...
    loading = $('#search-loading');
    loading.attr('class', 'loading inload');
    // Get and update meteo
    getMeteoByCity(city, function (data, error) {
        if (error == null) {
            displayMeteo(data);
        }
        else {
            meteoTitle = $('#meteo-title span');
            meteoTitle.html('City <span class="text-muted">' + city + '</span> not found');
        }
        // Stop loader
        setTimeout(function () {
            loading.attr('class', 'loading')
        }, 500);
    });
});


// -- Core --
$("#meteo-form").submit(function (event) {
    // Loading...
    loading = $('#search-loading');
    loading.attr('class', 'loading inload');
    // Get and update meteo
    var city = event.currentTarget[0].value;
    getMeteoByCity(city, function (data, error){
        if (error == null) {
            displayMeteo(data);
        }
        else {
            meteoTitle = $('#meteo-title span');
            meteoTitle.html('City <span class="text-muted">' + city + '</span> not found');
        }
        // Stop loader
        setTimeout(function () {
            loading.attr('class', 'loading')
        }, 500);
    });
    // Don't refresh the page
    return false;
});

$("#geolocation").click(function (event) {
    navigator.geolocation.getCurrentPosition(function (position) {
        // Loading...
        loading = $('#search-loading');
        loading.attr('class', 'loading inload');
        // Get latitude and longitude
        var lat = position.coords.latitude
        var lon = position.coords.longitude
        // Get and update meteo
        getMeteoByCoordinates(lat, lon, function (data, error) {
            if (error == null) {
                displayMeteo(data);
            }
            else {
                meteoTitle = $('#meteo-title span');
                meteoTitle.html('Can\'t  get meteo for your position');
            }
            // Stop loader
            setTimeout(function () {
                loading.attr('class', 'loading')
            }, 500);
        });
    });
});

function getMeteoByCity(city, callback){
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&APPID=" + API_KEY,
        success: function(data){
            callback(data, null);
        },
        error: function(req, status, error){
            callback(null, error);
        }
    });
}

function getMeteoByCoordinates(lat, lon, callback){
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&APPID=" + API_KEY,
        success: function(data){
            callback(data, null);
        },
        error: function(req, status, error){
            callback(null, error);
        }
    });
}



function displayMeteo(data){
   
    var tempAvg = 0;
    for (var i = 0; i < 6; i++){
        // Get meteo
        meteo = data.list[i*8];
        // Get DOM elements
        day = $("#meteo-day-" + (i + 1));
        icon = day.find(".meteo-temperature .wi");
        temperature = day.find(".meteo-temperature .data");
        humidity = day.find(".meteo-humidity .meteo-block-data");
        wind = day.find(".meteo-wind .meteo-block-data");
        sunrise = day.find(".meteo-sunrise .meteo-block-data");
        sunset = day.find(".meteo-sunset .meteo-block-data");
       // uvindex = day.find(".meteo-uv .meteo-block-data")
        // Update DOM
        code = meteo.weather[0].id;
        icon.attr('class', 'wi wi-owm-' + code);
        temperature.text(toFarenheit(meteo.main.temp) + "°F");
        humidity.text(meteo.main.humidity + "%");
        wind.text(meteo.wind.speed + " mph");
       // uv.text(meto.main.uv + " ");
        tempAvg += meteo.main.temp;
    }
   ;
}
function pad(n, p, c) {
    var pad_char = typeof c !== 'undefined' ? c : '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}

/*
 * Convert Kelvin to Farenhei
 */
function toFarenheit(kelvin) {
    var deg = kelvin - 273.15 ;
    return (Math.round(deg)) * 1.8 + 32;
}


