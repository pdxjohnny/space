class FakeLocalStorage {
  constructor() {
    this.storage = {};
  }

  getItem(key) {
    var value = this.storage[key];
    if (typeof value === "undefined") {
      return null;
    }
    return value;
  }

  setItem(key, value) {
    this.storage[key] = value;
  }
}

class LocalDatabase {
  constructor(dbName, prepopulate) {
    this.dbName = dbName;
    if (typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined") {
      this.storage = window.localStorage;
    } else {
      // console.warn("Using FakeLocalStorage");
      this.storage = new FakeLocalStorage();
    }
    if (typeof prepopulate === "object") {
      for (var i in prepopulate) {
        this.put(i, prepopulate[i]);
      }
    }
  }

  get(key) {
    return new Promise((resolve, reject) => {
      var value = this.storage.getItem(this.dbName + "_" + key);
      if (value === null) {
        reject(null);
      } else {
        resolve(value);
      }
    });
  }

  put(key, value) {
    return new Promise((resolve, reject) => {
      try {
        // console.log("DB: setting:", key, "=", value);
        this.storage.setItem(this.dbName + "_" + key, value);
        resolve(value);
      } catch (err) {
        reject(err);
      }
    });
  }
}

var db = {
  Stats: new LocalDatabase('stats', {
    testShip: {
      _id: '',
      ship: 'testShip',
      keys_down: {},
      x: 0,
      y: 0,
      max_speed: 200,
      speed: 0,
      acceleration: 30,
      max_warp: 500,
      warp: false,
      image: 'testShip',
      rate_of_turn: 30
    }
  }),
  Ships: new LocalDatabase('ships')
};
if (typeof module === "object") {
  module.exports = db;
}
