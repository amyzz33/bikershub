const User = require("../models/User");
const Club = require("../models/Club");
const Ride = require("../models/Ride");
const Post = require("../models/Post");

exports.globalSearch = async (req, res) => {
  try {

    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({ msg: "Search query required" });
    }

    const regex = new RegExp(query, "i");

    const [users, clubs, rides, posts] = await Promise.all([

      User.find({ username: { $regex: regex } })
        .select("username bikes")
        .limit(10),

      Club.find({ name: { $regex: regex } })
        .select("name description")
        .limit(10),

      Ride.find({ title: { $regex: regex } })
        .populate("createdBy", "username")
        .limit(10),

      Post.find({ caption: { $regex: regex } })
        .populate("author", "username")
        .limit(10)

    ]);

    res.json({
      users,
      clubs,
      rides,
      posts
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};