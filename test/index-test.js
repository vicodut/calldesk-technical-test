var assert = require('assert');
var expect = require('chai').expect;
const Index = require('../dist/index.js');
const admin = require('firebase-admin');

const test = require('firebase-functions-test')();

describe('Functions', function() {
  it('Test http function', () => {
    const req = { body: {queryResult: {parameters: {currency: {amount: 1, currency: 'EUR'}, curr2: 'EUR'}}} };
    const res = {
      json: (res) => {
        assert.equal(res, '1 EUR is 1.00 EUR');
        done();
      }
    };
    Index.helloWorld(req, res);
  });

  it('Test http function', () => {
    const req = { body: {queryResult: {parameters: {curr1: 'EUR', curr2: 'EUR'}}} };
    const res = {
      json: (res) => {
        assert.equal(res, '1 EUR is 1.00 EUR');
        done();
      }
    };
    Index.helloWorld(req, res);
  });

  it('Test convert currency', () => {
    Index.getCurrency('EUR_USD').then((res) => {
      expect(res).to.be.a('number');
    });
  });

  it('Test response sentence', () => {
    expect(  Index.buildResponse(1, 1, {curr1: 'EUR', curr2: 'USR'})).to.be.a('string')
      .and.equals('1 EUR is 1.00 USR');
  });
});
