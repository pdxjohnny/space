var player = function player(name) {
  this.stats._id = name;
  this.image = this.newImage();
  this.key_down_event = this.create_key_down_event();
  this.key_up_event = this.create_key_up_event();
  if (typeof db === 'undefined') {
    db = require("./db.js");
  }
  this.db = db;
  this.load();
}

if (typeof sprite === 'undefined') {
  sprite = require("./sprite.js");
}
player.prototype = new sprite();
player.prototype.constructor = player;

player.prototype.center = function(canvas_div) {
  this.x = canvas_div.width / 2;
  this.y = canvas_div.height / 2;
}

player.prototype.start_movement = function(canvas_div) {
  this.moving = true;
  this.center(canvas_div);
  document.addEventListener('keydown', this.key_down_event);
  document.addEventListener('keyup', this.key_up_event);
}

player.prototype.stop_movement = function() {
  this.moving = false;
  document.removeEventListener('keydown', this.key_down_event);
  document.removeEventListener('keyup', this.key_up_event);
}

player.prototype.create_key_down_event = function() {
  return function(player) {
    var handler = function(event) {
      player.key_down(event);
    }
    return handler;
  }(this);
}

player.prototype.create_key_up_event = function() {
  return function(player) {
    var handler = function(event) {
      player.key_up(event);
    }
    return handler;
  }(this);
}

player.prototype.save = function() {
  this.db.Stats.put(this.stats._id, this.stats)
    .then(function(stats) {
      console.log('Successfully saved stats', stats);
    })
    .catch(function(error) {
      console.log(error);
    });
}

player.prototype.load = function() {
  this.db.Stats.get(this.stats._id)
    .then(function(stats) {
      console.log('Successfully loaded stats', stats, this);
      this.update_stats(stats);
    }.bind(this))
    .catch(function(error) {
      console.log("ERROR loading stats", error);
      console.log("About to set default stats", this);
      this.update_stats({
        _id: this.stats._id,
        ship: 'default',
        keys_down: {},
        x: 0,
        y: 0,
        max_speed: 200,
        speed: 0,
        acceleration: 30,
        max_warp: 500,
        warp: false,
        image: 'default',
        rate_of_turn: 30
      });
    }.bind(this));
}

player.prototype.update_stats = function(stats) {
  this.stats = stats;
  if (typeof this.stats.image !== 'undefined') {
    this.image.src = this.stats.image;
    this.show = true;
  }
  delete this.stats.image;
  console.log(this.stats._id, 'loaded stats:', this);
}

if (typeof module === 'object') {
  module.exports = player;
}
