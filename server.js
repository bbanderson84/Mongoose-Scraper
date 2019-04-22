var express = require("express");
var mongoose = require("mongoose");


var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

// parse application body as json
app.use(express.urlencoded({extended: true}));

app.use(express.json());

// serve static content for the app from public directory in application
app.use(express.static("public"));

//set handlebars
var exphbs = require("express-handlebbars");

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/mongoosescraperdb", { useNewUrlParser: true });

//ROUTES

app.get("/scrape", function (req, res) {
    axios.get("").then(function(response) {
        var $ = cheerio.load(response.data);

    });
});
