var assert = require('assert');
var player = require("../player.js");

describe('player', function() {
  describe('#constructor()', function() {
    it('should instantiate without error', function() {
      var testPlayer = new player('testPlayer');
      assert.equal(testPlayer.stats._id, 'testPlayer');
    });
  });
});
