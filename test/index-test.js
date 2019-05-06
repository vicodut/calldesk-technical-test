var assert = require('assert');
var expect = require('chai').expect;

const Index = require('../dist/index.js');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('Test http function', () => {
      Index.helloWorld.then((res) => {
          expect(res.status.code).toBe(200);
      });
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
