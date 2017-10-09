console.log(__filename);

var PouchDB = require('pouchdb');
var express = require('express');
var app = express();

app.use('/', require('express-pouchdb')(PouchDB.defaults({
  prefix: '.db/',
}), {
    configPath: '.db/config.json',
    logPath: '.db/log.txt',
  }));

app.listen(5984);