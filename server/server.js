console.log(__filename);
var express = require('express');
var app = express();
var fs = require('fs');
var util = require('util');
const promisify = require('util.promisify'); //pre 8 compat

if (process.env.DB) {
  var ownPouch = false;
  var dbUrl = process.env.DB;
} else {
  var ownPouch = true;
  var dbUrl = '/db/kittens';
}

var root = process.cwd();




app.use(function (req, res, next) {
  if (!/^(\/db|\/$|\/\w*.html$|\/c\/)/.test(req.url)) req.url = req.originalUrl = '/db' + req.url;
  next();
});

app.get("/", function (request, response) {
  response.redirect('/index.html');
});
app.get("/index.html", function (request, response) {
  response.sendFile(root + '/views/index.html');
});




app.get("/aframe.html", async function (request, response) {
  var s = await aframify();
  response.send(s);
});

async function aframify() {
  var s = await promisify(fs.readFile)(root + '/views/index.html', 'utf8');
  const jsdom = require("jsdom");
  const dom = new jsdom.JSDOM(s);
  const doc = dom.window.document;
  doc.querySelector('#glitch').remove();
  doc.querySelector('#copy').remove();
  doc.querySelector('#rest').setAttribute('hidden', "true");
  var s = doc.querySelector('a-scene');
  s.removeAttribute('vr-mode-ui');
  s.removeAttribute('embedded');
  s.removeAttribute('style');
  s.setAttribute('inspect-immediate','');
  var s2 = doc.querySelector('#scene');
  s2.parentNode.insertBefore(s, s2);
  s2.remove();
  //console.log(dom.serialize());
  return dom.serialize();
}

(async function () {
  if (true) return;
  var s = await aframify();
  console.log(s)
})(); //test




app.get("/c/config.js", function (request, response) {
  response.send(`
    var config = ${JSON.stringify({ db: dbUrl, node: process.version }, null, 2)};
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

