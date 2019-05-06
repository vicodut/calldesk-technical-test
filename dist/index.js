const http = require('http');
const functions = require('firebase-functions');

const currHost = 'http://free.currconv.com/api/v7/convert?q=USD_PHP&apiKey=5a72d29dab3ab35a04c6';

/**
 * callWeatherApi - description
 *
 * @param  {type} city description
 * @param  {type} date description
 * @return {type}      description
 */

/**
 * getCurrency - description
 *
 * @param  {type} curr description
 * @return {type}      description
 */
function getCurrency() {
  return new Promise((resolve, reject) => {
    http.get(currHost, res => {
      let body = '';
      res.on('data', d => {
        body += d;
      });

      res.on('end', () => {
        const response = JSON.parse(body);
        resolve(response.results.USD_PHP.val);
      });

      res.on('error', error => {
        reject(error);
      });
    });
  });
}

exports.helloWorld = functions.https.onRequest((req, res) => {
  let amount = 1;
  let curr1 = '';
  let curr2 = '';

  if (typeof req.body.queryResult.parameters.curr1 === 'object') {
    ({ amount, curr2 } = req.body.queryResult.parameters);
    ({ amount } = req.body.queryResult.parameters.curr1);
    curr1 = req.body.queryResult.parameters.curr1.currency;
  } else {
    ({ curr1, curr2 } = req.body.queryResult.parameters);
  }

  console.log(amount, curr1, curr2);
  getCurrency().then(output => {
    res.json({ fulfillmentText: output });
  }).catch(error => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ speech: error, displayText: error }));
  });
});