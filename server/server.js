console.log(__filename);
var express = require('express');
var app = express();
var fs = require('fs');
var path = require("path");

var ist = require('../client/inServerToo');

var util = require('util');
const promisify = require('util.promisify'); //pre 8 compat

if (process.env.DB) {
  var ownPouch = false;
  var dbUrl = process.env.DB;
} else {
  var ownPouch = true;
  var dbUrl = '/db/kittens';
}

var root = path.join(__dirname, '..');




app.use(function (req, res, next) {
  if (!/^(\/db|\/$|\/\w*\.html$|\/c\/|\/service-worker\.js$)/.test(req.url)) req.url = req.originalUrl = '/db' + req.url;
  next();
});

app.get("/", function (request, response) {
  response.redirect('/index.html');
});
app.get("/index.html", function (request, response) {
  response.sendFile(root + '/views/index.html');
});
app.get("/service-worker.js", function (request, response) {
  response.sendFile(root + '/service-worker.js');
});



app.get("/aframe.html", async function (request, response) {
  var $ = await aframify();
  response.send($.html());
});

app.get("/inspector.html", async function (request, response) {
  var $ = await aframify();
  var s = $('a-scene');
  s.attr('inspect-immediate', '');
  response.send($.html());
});

async function aframify() {
  const cheerio = require('cheerio');
  var s = await promisify(fs.readFile)(root + '/views/index.html', 'utf8');
  const $ = cheerio.load(s);
  $('#glitch').remove();
  $('#copy').remove();
  $('#rest').attr('hidden', "true");
  var s = $('a-scene');
  s.removeAttr('embedded');
  s.removeAttr('vr-mode-ui');//in template switched off
  s.removeAttr('style');
  var s2 = $('#scene');
  $('#scene').replaceWith(s);
  return $;
}

(async function () {
  if (!false) return;
  try {
    var s = await aframify();
    console.log(s.html())
  } catch (e) {
    console.log(e);
  }
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
  ist.config.db = dbUrl;
  var db = ist.connectRemoteDb();

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



(async function () {
  var info = await db.info();
  console.log("db", info);
  var now = new Date().toJSON();
  ist.main.local.name = (ownPouch ? "couch/" : "pouch/") + now;
  console.log("\nname", ist.main.local.name);

  saveAScene();

  db.changes({
    since: 'now',
    live: true,
  }).on('change', function (change) {
    // received a change
    console.log('change', change);
    if (!change.deleted && change.id === "mittens") {
      saveAScene(); //makes await sense?
    }
  }).on('error', function (err) {
    // handle errors
    console.log('change', change);
  });

})();

async function saveAScene() {
  try {
    var doc = await db.get('mittens');
  } catch (err) {
    if (err.name !== 'not_found')
      throw err;
    console.log('no mittens yet');
    return;
  }
  fs.writeFile(root + '/sync/ascene.html', doc.aScene, function (err) {
    console.log("wrote mittens or", err);
  });
}


var port = process.env.PORT || port;
app.listen(port);//5984
console.log(port, ownPouch, dbUrl);

