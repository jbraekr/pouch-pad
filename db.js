console.log(__filename);

var PouchDB = require('pouchdb');
var express = require('express');
var app = express();

var TempPouchDB = PouchDB.defaults({
  prefix: '.db/',
});

var db = new TempPouchDB('kittens', { auto_compaction: true });

/* if the log shows the warning below, can it be ignored?
  This says yes: https://github.com/pouchdb/pouchdb/issues/6123
  Message: "MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 destroyed listeners added. Use emitter.setMaxListeners() to increase limit"
  */

app.use('/',
  require('cors')({ origin: "*" }),
  require('express-pouchdb')(TempPouchDB, {
    configPath: '.db/config.json',
    logPath: '.db/log.txt',
  }));

app.listen(5984);