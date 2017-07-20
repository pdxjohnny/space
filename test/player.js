var assert = require('assert');
var player = require("../player.js");

describe('player', function() {
  describe('#constructor()', function() {
    it('should instantiate without error', function() {
      var testPlayer = new player('testPlayer');
      assert.equal(testPlayer.stats._id, 'testPlayer');
    });
  });
  describe('#load()', function() {
    it('should load default', function(done) {
      var testPlayer = new player('testPlayer');
      testPlayer.load()
        .then(function(stats) {
          assert.equal(testPlayer.image.src, 'default');
          done(new Error("Loaded non-default"));
        })
        .catch(function(error) {
          if (error.message !== "Loaded default") {
            done(new Error("Failed to load default"));
          } else {
            done();
          }
        });
    });
    it('should load specified', function(done) {
      var testPlayer = new player('testShip');
      testPlayer.load()
        .then(function(stats) {
          assert.equal(testPlayer.image.src, 'testShip');
          done();
        })
        .catch(function(error) {
          done(error);
        });
    });
  });
});
