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

//GET route for scraping msn website
app.get("/scrape", function (req, res) {
    //grab body of html with axios
    axios.get("https://www.msn.com/en-us/news").then(function(response) {
        //load into cheerio and save it to $ for shorthand selector
        var $ = cheerio.load(response.data);
        // grab every h2 within article tag 
        $("article h2").each(function(i, element) {
            //save empty result object
            var result = {};
            //add text, href of link, summary and save them of properties of result object
            result.title = $(this)
            .children("a")
            .text();
            result.url = $(this)
            .children("a")
            .attr("href");
            result.summary =$(this)
            .children("a")
            .text();

            // create new article using 'result' object built from scrape
            db.Article.create(result)
            .then(function(dbArticle) {
                console.log(dbArticle);
            })
            .catch(function(err) {
                console.log(err);
            });
        });

        // send message to client
        res.send("Scrape Complete");


    });
});

//route for gett all articles from db
app.get("/articles", function (req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        console.log(err);
        res.json(err);
    });
});

//route for grabbing specific article by id and populate it with its note
app.get("/articles/:id", function (req, res){
    //using id passed in id param, prepare a query finding the matching one in db
    db.Article.findOne({_id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);

    });
});

// route for saving and updating articles note
app.post("/articles/:id", function (req, res) {
    //create new note and pass req.bdoy to entry
    db.Note.create(req.body)
    .then(function (dbNote) {
        //if note created, find article with id equal to req.params.id. update article to be associate with the new note
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, {new: true});

    }).then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.listen(PORT, function () {
    console.log("app running on port " + PORT + "!");
});