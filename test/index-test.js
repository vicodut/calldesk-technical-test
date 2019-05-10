var assert = require('assert');
var expect = require('chai').expect;
const Index = require('../dist/index.js');
const admin = require('firebase-admin');

const test = require('firebase-functions-test')();

describe('Functions', function() {
  describe('Currency', function() {
    it('Test http function', () => {
      const req = { body: {queryResult: {parameters: {currency: {amount: 1, currency: 'EUR'}, curr2: 'EUR'}}} };
      const res = {
        json: (res) => {
          assert.equal(res.fulfillmentText, '1 EUR is 1.00 EUR');
        }
      };
      Index.currency(req, res);
    });

    it('Test http function', () => {
      const req = { body: {queryResult: {parameters: {curr1: 'EUR', curr2: 'EUR'}}} };
      const res = {
        json: (res) => {
          assert.equal(res.fulfillmentText, '1 EUR is 1.00 EUR');
        }
      };
      Index.currency(req, res);
    });

    it('Test http function with wrong currency', () => {
      const req = { body: {queryResult: {parameters: {curr1: 'R', curr2: 'EUR'}}} };
      const res = {
        json: (res) => {
          assert.equal(res.fulfillmentText, 'No currency found');
        }
      };
      Index.currency(req, res);
    }); 

    it('Test convert currency', () => {
      Index.getCurrency('EUR_USD').then((res) => {
        expect(res).to.be.a('number');
      });
    });


    it('Test convert wrong currency', () => {
      Index.getCurrency('UR_USD').then((res) => {
        expect(res).to.be.a('number');
      });
    });

    it('Test response sentence', () => {
      expect(  Index.buildResponseCurrencies(1, 1, {curr1: 'EUR', curr2: 'USR'})).to.be.a('string')
        .and.equals('1 EUR is 1.00 USR');
    });
  });

  describe('Country', function() {
    it('Test http function', () => {
      const req = { body: {queryResult: {parameters: {country: 'France'}}} };
      const res = {
        json: (res) => {
          assert.equal(res.fulfillmentText, 'France use European euro (€ - EUR)');
        }
      };
      Index.currency(req, res);
    });

    it('Test http function wrong entry data', () => {
      const req = { body: {queryResult: {parameters: {country: 'frnce'}}} };
      const res = {
        json: (res) => {
          assert.equal(res.fulfillmentText, 'No country found');
        }
      };
      Index.currency(req, res);
    });

    it('Test getCountry with wrong name', () => {
      Index.getCountryDatas('frace').then((res) => {
        expect(res).equals(-1);
      });
    });


    it('Test convert currency', () => {
      Index.getCountryDatas('France').then((res) => {
        expect(res).to.be.a('object');
      });
    });

    it('Test response sentence', () => {
      expect(  Index.buildResponseCountry({"alpha3":"FRA","currencyId":"EUR","currencyName":"European euro","currencySymbol":"€","id":"FR","name":"France"})).to.be.a('string')
        .and.equals('France use European euro (€ - EUR)');
    });
  })
});
