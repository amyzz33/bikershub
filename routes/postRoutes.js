const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const postController = require("../controllers/postController");

/* CREATE POST */
router.post("/", protect, postController.createPost);

/* GLOBAL FEED */
router.get("/", protect, postController.getAllPosts);

/* SMART FEED */
router.get("/feed", protect, postController.getSmartFeed);

/* LIKE POST */
router.put("/like/:id", protect, postController.likePost);

module.exports = router;