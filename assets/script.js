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
        day = $("#weather-day-" + (i+1));
        day.find(".name").text(date.format("dddd"));
        day.find(".date").text(date.format("MM/DD"));
        // Go to the next day
        date = date.add(1, 'days')
    }
    // Loading...
   
    getWeatherByCity(city, function (data, error) {
        if (error == null) {
            displayWeather(data);
        }
        else {
            weatherTitle = $('#weather-title span');
            weatherTitle.html('City <span class="text-muted">' + city + '</span> not found');
        }
        // Stop loader
        setTimeout(function () {
            loading.attr('class', 'loading')
        }, 500);
    });
});


// -- Core --
$("#weather-form").submit(function (event) {
    // Loading...
    loading = $('#search-loading');
    loading.attr('class', 'loading inload');
    // Get and update weather
    var city = event.currentTarget[0].value;
    getWeatherByCity(city, function (data, error){
        if (error == null) {
            displayWeather(data);
        }
        else {
            weatherTitle = $('#weather-title span');
            weatherTitle.html('City <span class="text-muted">' + city + '</span> not found');
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
        getWeatherByCoordinates(lat, lon, function (data, error) {
            if (error == null) {
                displayWeather(data);
            }
            else {
                weatherTitle = $('#weather-title span');
                weatherTitle.html('Can\'t  get weather for your position');
            }
            // Stop loader
            setTimeout(function () {
                loading.attr('class', 'loading')
            }, 500);
        });
    });
});

function getWeatherByCity(city, callback){
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

function displayWeather(data){
   
    var tempAvg = 0;
    for (var i = 0; i < 6; i++){
        // Get weather
        weather = data.list[i*8];
        // Get DOM elements
        day = $("#weather-day-" + (i + 1));
        icon = day.find(".weather-temperature .wi");
        temperature = day.find(".weather-temperature .data");
        humidity = day.find(".weather-humidity .weather-block-data");
        wind = day.find(".weather-wind .weather-block-data");
    
        // Update DOM
        code = weather.weather[0].id;
        temperature.text(toFarenheit(weather.main.temp) + "°F");
        humidity.text(weather.main.humidity + "%");
        wind.text(weather.wind.speed + " mph");
       
        tempAvg += weather.main.temp;
    }
   ;
}
function pad(n, p, c) {
    var pad_char = typeof c !== 'undefined' ? c : '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}

/*
 * Convert Kelvin to Farenheit
 */
function toFarenheit(kelvin) {
    var deg = kelvin - 273.15 ;
    return (Math.round(deg)) * 1.8 + 32;
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
            if (t < 1 / 10) return p + (q - p) * 10 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 5) return p + (q - p) * (2 / 3 - t) * 10;
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

