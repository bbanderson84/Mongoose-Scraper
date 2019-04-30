
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
var cheerio = require("cheerio");

var axios = require("axios");


// Set mongoose 
mongoose.Promise = Promise;

//Define port
var PORT = process.env.PORT || 3000

//initialize express
var app = express();

// parse application body as json
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: false}));


// public directory in application
app.use(express.static("public"));

//set handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({defaultLayout: "main",
partialsDir: path.join(__dirname, "/views/layouts/partials")}));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/mongoosescraperdb", { useNewUrlParser: true });

//ROUTES

app.get("/", function (req, res) {
    Article.find({"saved": false}, function(err, data) {
        var hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("home", hbsObject);
    });
});

app.get("/saved", function (req, res) {
    Article.find({ "saved": true })
    .populate("notes")
    .exec(function (err, articles) {
        if (err) {
            console.log(err);
        } else {
            var hbsObject = {
                article: articles
            }
            console.log("hbsObject:", hbsObject);
            res.render("saved", hbsObject);
        }
    });
});

// get route to scrape reddit
app.get("/scrape", function (req, res) {
    //grab body of html with axios
    axios.get("https://old.reddit.com/new/").then(function(response) {
        // if (error) {
        //     console.log("Request error:", error);
        // }
    
    //load into cheerio and save it to $ for shorthand selector
        var $ = cheerio.load(response.data);
        // var result = {};
      

        // // grab every h2 within article tag 
        // $("p.summary").each(function(i, element) {
        //     // var title = $(element).text();
        //     // var link = $(element).children().attr("href");
        //     var summary =$(element).children("h2").text();
        //     // result.link = $(this).find("a data-click-id").attr("href");
        //     // result.summary = $(this).find("p").text().trim();
        //     console.log(title);
        //     console.log(link);
        //     console.log(summary);
        



        //     results.push({
        //         // title: title,
        //         // link: link,
        //         summary: summary
        //       });
        // });


        $("p.title").each(function(i, element) {
            //save empty result object
            var results = {};
            //add text, href of link, summary and save them of properties of result object
         results.title = $(element).text();
         results.link = $(element).children().attr("href");
        //  results.summary =$(element).children("h2").text();
            // result.link = $(this).find("a data-click-id").attr("href");
            // result.summary = $(this).find("p").text().trim();
            console.log(results.title);
            console.log(results.link);
            // console.log(results.summary);
        



            // results.push({
            //     title: title,
            //     link: link,
            //     summary: summary
            //   });
        // });

            var entry = new Article(results);

            // save entry to db
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

//route for getting  articles from db
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
    Article.findOneAndUpdate({ "_id": req.params.id }, {saved: true})
    .exec(function(doc) {
        res.json(doc);
    })
    .catch(function(err) {
        res.json(err);
    });

});

app.post("/articles/delete/:id", function (req, res) {
        //if note created, find article with id equal to req.params.id. update article to be associate with the new note
    Article.findOneAndUpdate({ "_id": req.params.id }, {saved: false, "notes": []})
    .exec(function(doc) {
        res.json(doc);
    })
    .catch(function(err) {
        res.json(err);
    });
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

