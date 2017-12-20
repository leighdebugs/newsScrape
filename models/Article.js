// set requirements
var mongoose = require("mongoose");

// save reference to Schema constructor
var Schema = mongoose.Schema;

// new userschema object
var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// create Article model
var Article = mongoose.model("Article", ArticleSchema);

// export article model
module.exports = Article;
