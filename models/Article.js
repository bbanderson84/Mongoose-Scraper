var mongoose = require("mongoose");

//Save a reference to schema constructor
var Schema = mongoose.Schema;

// Create a new user schema object using schema constructor
var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },

    url: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

// Creates model from above schema using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

//Export the model
module.exports = Article;