const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { getIO } = require("../socket/socket");

/* CREATE POST */
exports.createPost = async (req, res) => {
  try {

    const post = await Post.create({
      author: req.user.id,
      content: req.body.content,
      club: req.body.club || null
    });

    const populatedPost = await post.populate("author", "username email");

    const io = getIO();

    io.emit("newPost", populatedPost);

    res.status(201).json(populatedPost);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* GET ALL POSTS (GLOBAL FEED) */
exports.getAllPosts = async (req, res) => {
  try {

    const posts = await Post.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* LIKE / UNLIKE POST */
exports.likePost = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(404).json({ msg: "Post not found" });

    const alreadyLiked = post.likes.includes(req.user.id);

    if (alreadyLiked) {

      post.likes = post.likes.filter(
        id => id.toString() !== req.user.id
      );

    } else {

      post.likes.push(req.user.id);

      /* CREATE NOTIFICATION */
      if (post.author.toString() !== req.user.id) {

        await Notification.create({
          recipient: post.author,
          sender: req.user.id,
          type: "like",
          post: post._id
        });

      }

    }

    await post.save();

    /* REALTIME LIKE UPDATE */
const io = getIO();

io.emit("postLiked", {
  postId: post._id,
  likesCount: post.likes.length
});

    res.json(post);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* SMART FEED (FOLLOWING USERS) */
exports.getSmartFeed = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user.id);

    if (!currentUser)
      return res.status(404).json({ msg: "User not found" });

    const usersForFeed = [
      ...currentUser.following,
      req.user.id
    ];

    const posts = await Post.find({
      author: { $in: usersForFeed }
    })
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({
      author: { $in: usersForFeed }
    });

    res.json({
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      posts
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};