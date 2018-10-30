const express = require('express');
const router = express.Router();
const distance = require('google-distance');
const zomato = require('zomato');
const apiConfig = require('../api-requests/apiFile.js')
const OpenWeatherMapHelper = require("openweathermap-node");

router.use(function (req, res,next) {
    console.log("Index: /" +req.method);
    next();
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

//Get details from index page and rendering to results page
router.post('/city', function(routeReq, routeRes, next){

    routeRes.set('Content-Type', 'application/json');

    let formData = routeReq.body;

    let client = zomato.createClient({
        userKey: apiConfig.zomato.key,
    });
    let response;
    let det = [];

    //Get location categories from zomato
    client.getLocations({
        query:formData.city, // suggestion for location name
        count:"1" // number of maximum result to fetch
    }, function(err, result){
        if(!err){
            let results = JSON.parse(result);
            for (let i = 0; i < results.location_suggestions.length; i++){
                //From the results got from client.getLocation getting information of restaurants
                client.getLocationDetails({
                    entity_id: results.location_suggestions[i].entity_id, //location id obtained from locations api
                    entity_type:results.location_suggestions[i].entity_type //location type obtained from locations api
                }, function(error, res){
                    if(!err){
                        let ress = JSON.parse(res);
                        for (let j = 0; j < ress.best_rated_restaurant.length; j++) {
                            response = {
                                RestaurantID: ress.best_rated_restaurant[j].restaurant.id,
                                RestaurantName: ress.best_rated_restaurant[j].restaurant.name,
                                RestaurantLat: ress.best_rated_restaurant[j].restaurant.location.latitude,
                                RestaurantLon: ress.best_rated_restaurant[j].restaurant.location.longitude,
                                RestaurantAdd: ress.best_rated_restaurant[j].restaurant.location.address,
                                RestaurantCui: ress.best_rated_restaurant[j].restaurant.cuisines,
                                RestaurantPrice: ress.best_rated_restaurant[j].restaurant.average_cost_for_two,
                                RestaurantThumb: ress.best_rated_restaurant[j].restaurant.thumb,
                                RestaurantRate: ress.best_rated_restaurant[j].restaurant.user_rating.aggregate_rating,
                                City: ress.best_rated_restaurant[j].restaurant.location.city
                            };
                            det.push(response);
                        }
                    }else {
                        console.log(error);
                    }
                    routeRes.set('Content-Type', 'text/html');
                    routeRes.render('results', {
                        info: routeReq.body,
                        det: det
                    });
                });
            }
        }else {
            console.log(err);
        }
    });

});

//Getting data from results and rendering into map file
router.post('/location', function(routeReq, routeRes, next) {
    routeRes.set('Content-Type', 'application/json');

    let LatLonFromResults = routeReq.body;

    let city = LatLonFromResults.citySelected;

    let client = zomato.createClient({
        userKey: apiConfig.zomato.key,
    });

    const helper = new OpenWeatherMapHelper(
        {
            APPID: apiConfig.openweather.key,
            units: "metric"
        }
    );

    let response;
    let det = [];
    let wea = [];

    //getting location details
    client.getLocations({
        query:city, // suggestion for location name
        count:"1" // number of maximum result to fetch
    }, function(err, result){
        if(!err){
            let results = JSON.parse(result);
            for (let i = 0; i < results.location_suggestions.length; i++){
                client.getLocationDetails({
                    entity_id: results.location_suggestions[i].entity_id, //location id obtained from locations api
                    entity_type:results.location_suggestions[i].entity_type //location type obtained from locations api
                }, function(error, res){
                    if(!err){
                        let ress = JSON.parse(res);
                        for (let j = 0; j < ress.best_rated_restaurant.length; j++) {
                            response = {
                                RestaurantID: ress.best_rated_restaurant[j].restaurant.id,
                                RestaurantName: ress.best_rated_restaurant[j].restaurant.name,
                                RestaurantLat: ress.best_rated_restaurant[j].restaurant.location.latitude,
                                RestaurantLon: ress.best_rated_restaurant[j].restaurant.location.longitude,
                                RestaurantRatext: ress.best_rated_restaurant[j].restaurant.user_rating.rating_text,
                            };
                            det.push(response);
                        }
                    }else {
                        console.log(error);
                    }
                    //Destination details from zomato api results to be used in google directions and open weather api
                    let destination = {lat: det[i].RestaurantLat, lng: det[i].RestaurantLon};
                    //Finds the information about directions from google directions api
                    distance.get(
                        {
                            origin: 'Brisbane, QLD',
                            destination: destination.lat +','+ destination.lng
                        },
                        function(err, data) {
                            if (err) {return console.log("uh-Oh, Something Happened" + err)};

                            let responselocation = {  ResDistance: data.distance,
                                ResDuration: data.duration,
                                MyOrigin: data.origin,
                                ResDestination: data.destination,
                                DriveMode: data.mode,
                            };

                            //console.log(destination);
                            //Gets weather details of the given coordinates
                            helper.getCurrentWeatherByGeoCoordinates(destination.lat, destination.lng, (err, currentWeather) => {
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    let weather = { WeatherDes: currentWeather.weather[0].main,
                                        CurrentTemp: currentWeather.main.temp,
                                        Humidity: currentWeather.main.humidity,
                                        MinTemp: currentWeather.main.temp_min,
                                        MaxTemp: currentWeather.main.temp_max,
                                        WindSpeed: currentWeather.wind.speed,
                                    };
                                    wea.push(weather);
                                }
                                //console.log(wea);
                                //console.log(wea[0].WeatherDes);
                                routeRes.set('Content-Type', 'text/html');
                                routeRes.render('map', {
                                    info: routeReq.body,
                                    det: det,
                                    dis: responselocation,
                                    weather: wea
                                });
                            });

                        });

                });
            }
        }else {
            console.log(err);
        }
    });
});

module.exports = router;
