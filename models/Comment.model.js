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
    default:
      "https://images.pexels.com/photos/4064080/pexels-photo-4064080.jpeg?cs=srgb&dl=pexels-marcus-aurelius-4064080.jpg&fm=jpg",
  },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
