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

app.use(function (req, res, next) {
  if (!/^\/db\//.test(req.url)) {
    console.log(req.url);
    if (!/^(\/$|\/index.html$|\/c\/)/.test(req.url)) req.url = req.originalUrl = '/db' + req.url;
    console.log('->', req.url);
  }
  next();
});

app.get("/", function (request, response) {
  response.redirect('/index.html');
});
app.get("/index.html", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/c/config.js", function (request, response) {
  response.send(`
    var config = ${JSON.stringify({ db: '/db/kittens' }, null, 2)};
  `);
});

app.use('/c',express.static('public'));
app.use('/c',express.static('client'));

app.use('/db',
  require('cors')({ origin: "*" }),
  require('express-pouchdb')(TempPouchDB, {
    configPath: '.db/config.json',
    logPath: '.db/log.txt',
  }));

app.listen(3000);//5984