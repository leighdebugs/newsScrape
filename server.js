// declare dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// require models
var db = require("./models");

var PORT = 3000;

// init express
var app = express();

// morgan logger, logs requests
app.use(logger("dev"));
// body parser for form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// public folder as a static directory
app.use(express.static("public"));

// connect to newsscrape mongodb
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/newsscrape", {
  useMongoClient: true
});

// Routes

// scrape 
app.get("/scrape", function(req, res) {
  // get request for html
  axios.get("http://smittenkitchen.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // get and store link/title of articles
    $("article header h1").each(function(i, element) {
      var result = {};

      // save text and link as properties of result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // create new article with results
      db.Article
        .create(result)
        .then(function(dbArticle) {
        })
        .catch(function(err) {
          res.json(err);
        });
    });
    // indicate that scrape has been completed
    res.render("Scrape Complete");

  });
});

// get all articles from database and send to client
app.get("/articles", function(req, res) {
  db.Article
    .find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// get article by ID, prepare query to match to database
app.get("/articles/:id", function(req, res) {
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// save and update article notes
app.post("/articles/:id", function(req, res) {
  // create new note and pass to entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// start server, confirm connection
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
