var mongoose = require("mongoose");

//save reference to schema constructor
var Schema = mongoose.Schema;

//create noteschema object using schema constructor
var NoteSchema = new Schema({
    title: String,
    body: String
});

// creates model from above schema using mongoose's model method
var Note = mongoose.model("Note", NoteSchema);

// exports the model
module.exports = Note;