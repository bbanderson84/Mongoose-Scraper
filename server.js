
//dependencies
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var logger = require("morgan");
var path = require("path");

// Require article and note models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");


//scraping tools
var request = require("request");
var axios = require("axios");
var cheerio = require("cheerio");



// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

//Define port
var port = process.env.PORT || 3000

//initialize express
var app = express();

// parse application body as json
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: false}));




// serve static content for the app from public directory in application
app.use(express.static("public"));

//set handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/mongoosescraperdb", { useNewUrlParser: true });

//ROUTES

app.get("/", function (req, res) {
    Article.find({"saved": false}, function(err, data) {
        var hbObject = {
            article: data
        };
        console.log(hbObject);
        res.render("home", hbObject);
    });
});

app.get("/saved", function (req, res) {
    Article.find({ "saved": true })
    .populate("notes")
    .exec(function (err, articles) {
        if (err) {
            console.log(err);
        } else {
            var hbObject = {
                article: articles
            }
            console.log("hbObject:", hbObject);
            res.render('saved', hbObject);
        }
    });
});

// get route to scrape https://slashdot.org/
app.get("/scrape", function (req, res) {
    //grab body of html with axios
    axios.get("https://slashdot.org/").then(function(error, response) {
        if (error) {
            console.log("Request error:", error);
        }
    
    //load into cheerio and save it to $ for shorthand selector
        var $ = cheerio.load(response.data);
        // grab every h2 within article tag 
        $("article").each(function(i, element) {
            //save empty result object
            var result = {};
            //add text, href of link, summary and save them of properties of result object
            result.title = $(this).find("h2 span.story-title a").text();
            result.link = $(this).find("h2 span.story-title a").attr("href");
            result.summary = $(this).find("div.p").text().trim();

            var entry = new Article(result);
            

            // create new article using 'result' object built from scrape
            entry.save(function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });
       
        });

        // send message to client
        res.send("Scrape Complete");

    });
});

//route for gett all articles from db
app.get("/articles", function (req, res) {
    Article.find({})
    .then(function(doc) {
        res.json(doc);
    })
    .catch(function(err) {
        console.log(err);
        res.json(err);
    });
});

//route for grabbing specific article by id and populate it with its note
app.get("/articles/:id", function (req, res){
    //using id passed in id param, prepare a query finding the matching one in db
    Article.findOne({"_id": req.params.id })
    .populate("note")
    .then(function(doc) {
        res.json(doc);
    })
    .catch(function(err) {
        res.json(err);

    });
});

// route for saving and updating articles note
app.post("/articles/save/:id", function (req, res) {
    //if note created, find article with id equal to req.params.id. update article to be associate with the new note
    Article.findOneAndUpdate({ "_id": req.params.id }, {saved: true});

    }).then(function(doc) {
        res.json(doc);
    })
    .catch(function(err) {
        res.json(err);
    });

app.post("/articles/delete/:id", function (req, res) {
        //if note created, find article with id equal to req.params.id. update article to be associate with the new note
    Article.findOneAndUpdate({ "_id": req.params.id }, {saved: false});
    
    }).then(function(doc) {
        res.json(doc);
    })
    .catch(function(err) {
        res.json(err);
    });
    

app.post("/notes/save/:id", function (req, res) {
   var newNote = new Note({
       body: req.body.text,
       article: req.params.id
   });
   console.log(req.body);
   newNote.save(function(err, note) {
       if (err) {
           console.log(err);
       } else {
           Article.findOneAndUpdate({"_id": req.params.id }, {$push: {"notes": note } })
       .exec(function(err) {
           if (err) {
               console.log(err);
               res.send(err);
           } else {
               res.send(note);
           }
       });
   }
});

});

app.delete("/notes/delete/:note_id/:article_id", function (req, res) {
    //use note id to find and delete
    Note.findOneAndRemove({"_id": req.params.note_id }, function (err) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            Article.findOneAndUpdate({"_id": req.params.article_id}, {$pull: {"notes": req.params.note_id}})
            exec(function(err) {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.send("Note deleted.");
                }
            });
        }
    });
});



app.listen(PORT, function () {
    console.log("app running on port " + PORT + "!");
});