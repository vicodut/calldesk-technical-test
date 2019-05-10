// @flow

const http = require('http');
const functions = require('firebase-functions');

const host = 'http://free.currconv.com/api/v7';
const key = '5a72d29dab3ab35a04c6';


/**
 * getCountryDatas - call currconv api to get country data
 *
 * @param  {type} country: string country name
 * @return {type}                 country data from currconv
 */
function getCountryDatas(country: string) {
  const url = `${host}/countries?apiKey=${key}`;
  const myReg = new RegExp(`${country}.*`);
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';

      res.on('data', (d) => {
        body += d;
      });

      res.on('end', () => {
        const response = Object.values(JSON.parse(body).results);
        resolve(response.find(el => el.name.match(myReg) !== null)
          ? response.find(el => el.name.match(myReg) !== null) : -1);
      });

      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}

/**
 * getCurrency - call currconv api to get exchange rate
 *
 * @param  {type} currencyPair description
 * @param  {type} amount       amount to convert
 * @return {type}               exchange rate
 */
function getCurrency(currencyPair: string) {
  const url = `${host}/convert?q=${currencyPair}&apiKey=${key}`;
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';

      res.on('data', (d) => {
        body += d;
      });

      res.on('end', () => {
        const response = JSON.parse(body);
        if (response.results && response.results[currencyPair]) {
          resolve(response.results[currencyPair].val);
        } else {
          resolve(-1);
        }
      });

      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}


/**
 * buildResponse - build the response for exchange rate
 *
 * @param  {type} output: number  exchange rate
 * @param  {type} amount: number  Amount to convert
 * @param  {type} currencies: any Currency object {curr1: number, curr2: number}
 * @return {type}                 String of response
 */
function buildResponseCurrencies(output: number, amount: number, currencies: any) {
  return `${amount} ${currencies.curr1} is ${(amount * output).toFixed(2)} ${currencies.curr2}`;
}


/**
 * buildResponseCountry - build the response for country currency data
 *
 * @param  {type} output: any country currency data
 * @return {type}             String of response
 */
function buildResponseCountry(output: any) {
  return `${output.name} use ${output.currencyName} (${output.currencySymbol} - ${output.currencyId})`;
}

const currency = functions.https.onRequest((req, res) => {
  let amount: number = 1;
  let curr1: string = '';
  let curr2: string = '';
  let country: string = '';
  let currencyPair: string = '';

  // Get diffents parameter
  if (req.body.queryResult.parameters.currency) {
    ({ curr2 } = req.body.queryResult.parameters);
    ({ amount } = req.body.queryResult.parameters.currency);
    curr1 = req.body.queryResult.parameters.currency.currency;
  } else if (req.body.queryResult.parameters.country) {
    ({ country } = req.body.queryResult.parameters);
  } else {
    ({ curr1, curr2 } = req.body.queryResult.parameters);
  }

  // Call the good service and build & send his response
  if (req.body.queryResult.parameters.country) {
    getCountryDatas(country).then((output) => {
      let result: string = '';
      if (output === -1) {
        result = 'No country found';
      } else {
        result = buildResponseCountry(output);
      }
      res.json({ fulfillmentText: result });
    }).catch((error) => {
      res.send(JSON.stringify({ speech: error, displayText: error }));
    });
  } else {
    currencyPair = `${curr1}_${curr2}`;
    getCurrency(currencyPair).then((output) => {
      let result: string = '';
      if (output === -1) {
        result = 'No currency found';
      } else {
        result = buildResponseCurrencies(output, amount, { curr1, curr2 });
      }
      res.json({ fulfillmentText: result });
    }).catch((error) => {
      res.send(JSON.stringify({ speech: error, displayText: error }));
    });
  }
});

module.exports = {
  getCurrency,
  buildResponseCurrencies,
  buildResponseCountry,
  currency,
  getCountryDatas,
};
