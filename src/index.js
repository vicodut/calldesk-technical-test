// @flow

const http = require('http');
const functions = require('firebase-functions');

const host = 'http://free.currconv.com/api/v7/convert';
const key = '5a72d29dab3ab35a04c6';

/**
 * getCurrency - description
 *
 * @param  {type} currencyPair description
 * @param  {type} amount       description
 * @return {type}              description
 */
function getCurrency(currencyPair) {
  const url = `${host}?q=${currencyPair}&apiKey=${key}`;
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';

      res.on('data', (d) => {
        body += d;
      });

      res.on('end', () => {
        const response = JSON.parse(body);
        resolve(response.results[currencyPair].val);
      });

      res.on('error', (error) => {
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
function buildResponse(output: number, amount: number, currencies: any) {
  return `${amount} ${currencies.curr1} is ${(amount * output).toFixed(2)} ${currencies.curr2}`;
}

const helloWorld = functions.https.onRequest(async (req, res) => {
  let amount: number = 1;
  let curr1: string = '';
  let curr2: string = '';
  let currencyPair: string = '';

  if (req.body.queryResult.parameters.currency.amount) {
    ({ curr2 } = req.body.queryResult.parameters);
    ({ amount } = req.body.queryResult.parameters.currency);
    curr1 = req.body.queryResult.parameters.currency.currency;
  } else {
    ({ curr1, curr2 } = req.body.queryResult.parameters);
  }

  currencyPair = `${curr1}_${curr2}`;

  getCurrency(currencyPair).then((output) => {
    const result: string = buildResponse(output, amount, { curr1, curr2 });
    res.json({ fulfillmentText: result });
  }).catch((error) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ speech: error, displayText: error }));
  });
});

module.exports = {
  getCurrency,
  buildResponse,
  helloWorld,
};
