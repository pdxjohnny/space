var assert = require('assert');
var db = require("../db.js");

describe('LocalDatabase', function() {
  describe('#constructor()', function() {
    it('should instantiate without error', function() {
      var testDB = new db.LocalDatabase('testDB');
    });
  });
  describe('#put()', function() {
    it('should successfuly save', function(done) {
      var testDB = new db.LocalDatabase('testDB');
      testDB.put('key', 'value')
        .then(function(value) {
          assert.equal(value, 'value');
          done();
        })
        .catch(function(error) {
          done(error);
        });
    });
  });
  describe('#get()', function() {
    it('should successfuly load', function(done) {
      var testDB = new db.LocalDatabase('testDB');
      testDB.put('key', 'value')
        .then(function(value) {
          assert.equal(value, 'value');
          testDB.get('key')
            .then(function(value) {
              assert.equal(value, 'value');
              done();
            })
            .catch(function(error) {
              done(error);
            });
        })
        .catch(function(error) {
          done(error);
        });
    });
  });
});
