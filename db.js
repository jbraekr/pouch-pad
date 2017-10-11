console.log(__filename);

var PouchDB = require('pouchdb');
var express = require('express');
var app = express();

var TempPouchDB = PouchDB.defaults({
  prefix: '.db/',
});

var db = new TempPouchDB('kittens', { auto_compaction: true });

app.use('/',
  require('cors')({ origin: "*" }),
  require('express-pouchdb')(TempPouchDB, {
    configPath: '.db/config.json',
    logPath: '.db/log.txt',
  }));

app.listen(5984);