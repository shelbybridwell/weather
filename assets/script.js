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
        city = "London";
    }
    // Get and display current date
    date = moment();
    for (var i = 0; i < 3; i++){
        // Display date
        day = $("#meteo-day-" + (i+1));
        day.find(".name").text(date.format("dddd"));
        day.find(".date").text(date.format("DD/MM"));
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

function displaySunriseSunset(lat, long){
    date = moment();
    for (var i = 0; i < 3; i++) {
        // Get sunrise and sunset
        var times = SunCalc.getTimes(date, lat, long);
        var sunrise = pad(times.sunrise.getHours(), 2) + ':' + pad(times.sunrise.getMinutes(), 2);
        var sunset = pad(times.sunset.getHours(), 2) + ':' + pad(times.sunset.getMinutes(), 2);
        // Display sunrise and sunset
        day = $("#meteo-day-" + (i + 1));
        day.find('.meteo-sunrise .meteo-block-data').text(sunrise);
        day.find('.meteo-sunset .meteo-block-data').text(sunset);
        // Go to the next day
        date = date.add(1, 'days')
    }

}

function displayMeteo(data){
    // Update Google Map URL
    googleMapCity = "https://www.google.fr/maps/place/" + data.city.coord.lat + "," + data.city.coord.lon;
    $('#meteo-title span').html('Weather in <a href="' + googleMapCity + '" class="text-muted meteo-city" target="_blank">' + data.city.name + ', ' + data.city.country + '</a>');
    // Update meteo for each day
    var tempMoyenne = 0;
    for (var i = 0; i < 3; i++){
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
        // Update DOM
        code = meteo.weather[0].id;
        icon.attr('class', 'wi wi-owm-' + code);
        temperature.text(toCelsius(meteo.main.temp) + "°C");
        humidity.text(meteo.main.humidity + "%");
        wind.text(meteo.wind.speed + " km/h");
        tempMoyenne += meteo.main.temp;
    }
    displaySunriseSunset(data.city.coord.lat, data.city.coord.lon);
    // Get custom gradient according to the temperature
    tempMoyenne = toCelsius(tempMoyenne / 3);
    var hue1 = 30 + 240 * (30 - tempMoyenne) / 60;
    var hue2 = hue1 + 30;
    rgb1 = 'rgb(' + hslToRgb(hue1 / 360, 0.6, 0.5).join(',') + ')';
    rgb2 = 'rgb(' + hslToRgb(hue2 / 360, 0.6, 0.5).join(',') + ')';
    $('body').css('background', 'linear-gradient(' + rgb1 + ',' + rgb2 + ')');
}
function pad(n, p, c) {
    var pad_char = typeof c !== 'undefined' ? c : '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}

/*
 * Convert Kelvin to Celsius
 */
function toCelsius(kelvin) {
    var deg = kelvin - 273.15;
    return Math.round(deg);
}

/**
 * Source : http://web.archive.org/web/20081227003853/http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}