// @flow

const http = require('http');
const functions = require('firebase-functions');

const host = 'api.worldweatheronline.com';
const wwoApiKey = '0025337c0cae4a649d1145408190505';


/**
 * callWeatherApi - description
 *
 * @param  {type} city description
 * @param  {type} date description
 * @return {type}      description
 */
function callWeatherApi(city, date) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    const path: string = '/premium/v1/weather.ashx?format=json&num_of_days=1'
    + `&q=${encodeURIComponent(city)}&key=${wwoApiKey}${date}`;
    // Make the HTTP request to get the weather
    http.get({ host, path }, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        const response = JSON.parse(body);
        const forecast = response.data.weather[0];
        const location = response.data.request[0];
        const conditions = response.data.current_condition[0];
        const currentConditions = conditions.weatherDesc[0].value;

        // Create response
        const output = `Current conditions in the ${location.type}
        ${location.query} are ${currentConditions} with a projected high of
        ${forecast.maxtempC}°C or ${forecast.maxtempF}°F and a low of
        ${forecast.mintempC}°C or ${forecast.mintempF}°F on
        ${forecast.date}.`;

        // Resolve the promise with the output text
        resolve(output);
      });
      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}


exports.helloWorld = functions.https.onRequest((req, res) => {
  // Get the city and date from the request
  const city = 'Paris'; // city is a required param

  // Get the date for the weather forecast (if present)
  let date: string = '';
  if (req.body.queryResult.parameters.date) {
    ({ date } = req.body.queryResult.parameters);
  }

  // Call the weather API
  callWeatherApi(city, date).then((output) => {
    res.json({ fulfillmentText: output }); // Return the results of the weather API to Dialogflow
  }).catch((error) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ speech: error, displayText: error }));
  });
});
