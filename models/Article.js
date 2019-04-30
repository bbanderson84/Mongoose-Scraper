var mongoose = require("mongoose");
var Mpte = require("./Note");

//Save a reference to schema constructor
var Schema = mongoose.Schema;

// Create a new user schema object using schema constructor
var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    // summary: {
    //     type: String,
    //     required: true
    // },

    link: {
        type: String,
        required: true
    },

    saved: {
        type: Boolean,
        default: false
    },

    notes: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }]
});

// Creates model from above schema using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

//Export the model
module.exports = Article;