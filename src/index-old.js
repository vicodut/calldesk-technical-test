const functions = require('firebase-functions');
const http = require('http');

const url = 'http://free.currconv.com/api/v7/convert?q=USD_PHP&apiKey=5a72d29dab3ab35a04c6';
// const apiKey = '5a72d29dab3ab35a04c6';


/**
 * getConvert - description
 *
 * @return {type}  description
 */
function getConvert() {
  return new Promise((resolve, reject) => {
    http.get({ url }, (res) => {
      let body: string = '';
      http.on('data', (d) => { body += d; });

      res.on('end', () => {
        resolve(body);
      });

      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}

exports.helloWorld = functions.https.onRequest((request, response) => {
  getConvert().then((res) => {
    response.send(JSON.stringify({ speech: res, displayText: res }));
  });
  //
  // response.send({
  //   fulfillmentText: "Text defined in Dialogflow's console for the intent that was matched",
  //   fulfillmentMessages: [
  //     {
  //       text: {
  //         text: [
  //           'Salut',
  //         ],
  //       },
  //     }],
  // });
});
