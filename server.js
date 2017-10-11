console.log(__filename);

var express = require('express');
var app = express();

app.get("/index.html", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.get("/", function (request, response) {
  response.redirect('index.html');
});

app.get("/config.js", function (request, response) {
  response.send(`
    var config = ${JSON.stringify({ db: process.env.DB }, null, 2)};
  `);
});

app.use(express.static('public'));
app.use(express.static('client'));

app.listen(3000);