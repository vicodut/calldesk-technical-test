var assert = require('assert');
var expect = require('chai').expect;
const Index = require('../dist/index.js');
const admin = require('firebase-admin');

const test = require('firebase-functions-test')();

describe('Array', function() {
  describe('#indexOf()', function() {
    it('Test http function', () => {
      const req = { query: {text: 'input'} };
      const res = {
        redirect: (code, url) => {
          assert.equal(code, 303);
          assert.equal(url, 'new_ref');
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
});
