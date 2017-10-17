console.log(__filename);
var express = require('express');
var app = express();
var fs = require('fs');
var util = require('util');

if (process.env.DB) {
  var ownPouch = false;
  var dbUrl = process.env.DB;
} else {
  var ownPouch = true;
  var dbUrl = '/db/kittens';
}




app.use(function (req, res, next) {
  if (!/^(\/db|\/$|\/\w*.html$|\/c\/)/.test(req.url)) req.url = req.originalUrl = '/db' + req.url;
  next();
});

app.get("/", function (request, response) {
  response.redirect('/index.html');
});
app.get("/index.html", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/aframe.html", async function (request, response) {
  var s = await util.promisify(fs.readFile)(__dirname + '/views/index.html', 'utf8');
  response.send(s);
});

app.get("/c/config.js", function (request, response) {
  response.send(`
    var config = ${JSON.stringify({ db: dbUrl }, null, 2)};
  `);
});

app.use('/c', express.static('public'));
app.use('/c', express.static('client'));




if (!ownPouch) {
  var port = 3001;
} else {
  var port = 3000;
  var PouchDB = require('pouchdb');
  var TempPouchDB = PouchDB.defaults({
    prefix: '.db/',
  });

  var db = new TempPouchDB('kittens', { auto_compaction: true });

  app.use('/db',
    require('cors')({ origin: "*" }),
    require('express-pouchdb')(TempPouchDB, {
      configPath: '.db/config.json',
      logPath: '.db/log.txt',
    }));

  /* if the log shows the warning below, can it be ignored?
    This says yes: https://github.com/pouchdb/pouchdb/issues/6123
    Message: "MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 destroyed listeners added. Use emitter.setMaxListeners() to increase limit"
    */

}




var port = process.env.PORT || port;
app.listen(port);//5984
console.log(port, ownPouch, dbUrl);