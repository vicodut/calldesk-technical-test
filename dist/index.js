const http = require('http');
const functions = require('firebase-functions');

const host = 'http://free.currconv.com/api/v7';
const key = '5a72d29dab3ab35a04c6';

/**
 * getCountryDatas - description
 *
 * @param  {type} country: string description
 * @return {type}                 description
 */
function getCountryDatas(country) {
  const url = `${host}/countries?apiKey=${key}`;
  const myReg = new RegExp(`${country}.*`);
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let body = '';

      res.on('data', d => {
        body += d;
      });

      res.on('end', () => {
        const response = Object.values(JSON.parse(body).results);
        resolve(response.find(el => el.name.match(myReg) !== null) ? response.find(el => el.name.match(myReg) !== null) : -1);
      });

      res.on('error', error => {
        reject(error);
      });
    });
  });
}

/**
 * getCurrency - description
 *
 * @param  {type} currencyPair description
 * @param  {type} amount       description
 * @return {type}              description
 */
function getCurrency(currencyPair) {
  const url = `${host}/convert?q=${currencyPair}&apiKey=${key}`;
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let body = '';

      res.on('data', d => {
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

      res.on('error', error => {
        reject(error);
      });
    });
  });
}

/**
 * buildResponse - description
 *
 * @param  {type} output: number  description
 * @param  {type} amount: number  description
 * @param  {type} currencies: any description
 * @return {type}                 description
 */
function buildResponseCurrencies(output, amount, currencies) {
  return `${amount} ${currencies.curr1} is ${(amount * output).toFixed(2)} ${currencies.curr2}`;
}

/**
 * buildResponseCountry - description
 *
 * @param  {type} output: any description
 * @return {type}             description
 */
function buildResponseCountry(output) {
  return `${output.name} use ${output.currencyName} (${output.currencySymbol} - ${output.currencyId})`;
}

const currency = functions.https.onRequest((req, res) => {
  let amount = 1;
  let curr1 = '';
  let curr2 = '';
  let country = '';
  let currencyPair = '';

  if (req.body.queryResult.parameters.currency) {
    ({ curr2 } = req.body.queryResult.parameters);
    ({ amount } = req.body.queryResult.parameters.currency);
    curr1 = req.body.queryResult.parameters.currency.currency;
  } else if (req.body.queryResult.parameters.country) {
    ({ country } = req.body.queryResult.parameters);
  } else {
    ({ curr1, curr2 } = req.body.queryResult.parameters);
  }

  if (req.body.queryResult.parameters.country) {
    getCountryDatas(country).then(output => {
      let result = '';
      if (output === -1) {
        result = 'No country found';
      } else {
        result = buildResponseCountry(output);
      }
      res.json({ fulfillmentText: result });
    }).catch(error => {
      console.log(error);
    });
  } else {
    currencyPair = `${curr1}_${curr2}`;

    getCurrency(currencyPair).then(output => {
      let result = '';
      if (output === -1) {
        result = 'No currency found';
      } else {
        result = buildResponseCurrencies(output, amount, { curr1, curr2 });
      }
      res.json({ fulfillmentText: result });
    }).catch(error => {
      console.log(error);
    });
  }
});

module.exports = {
  getCurrency,
  buildResponseCurrencies,
  buildResponseCountry,
  currency,
  getCountryDatas
};