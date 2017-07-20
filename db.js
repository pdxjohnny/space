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
  constructor(dbName) {
    this.dbName = dbName;
    if (typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined") {
      this.storage = window.localStorage;
    } else {
      console.warn("Using FakeLocalStorage");
      this.storage = new FakeLocalStorage();
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
        this.storage.setItem(this.dbName + "_" + key, value);
        resolve(value);
      } catch (err) {
        reject(err);
      }
    });
  }
}

var stats_database = 'space';
var ships_database = 'spaceships';
var db = {
  Stats: new LocalDatabase(stats_database),
  Ships: new LocalDatabase(ships_database)
};
if (typeof module === "object") {
  module.exports = db;
}
