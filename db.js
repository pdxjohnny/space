var stats_database = 'space';
var ships_database = 'spaceships';

class LocalDatabase {
  constructor(dbName) {
    this.dbName = dbName;
    this.storage = window.localStorage;
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
  };
}

var db = {};
db[stats_database] = new LocalDatabase(stats_database);
db[ships_database] = new LocalDatabase(ships_database);