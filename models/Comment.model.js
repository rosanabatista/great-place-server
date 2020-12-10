const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  when: {
    type: Date,
    default: Date.now(),
  },
  body: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  place_id: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
