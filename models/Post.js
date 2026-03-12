const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  club: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Club",
  default: null
},
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    commentsCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);