const Conversation = require("../models/Conversation");

/* CREATE OR GET CONVERSATION */
exports.createOrGetConversation = async (req, res) => {
  try {

    const { userId } = req.body;

    let conversation = await Conversation.findOne({
      members: { $all: [req.user.id, userId] }
    });

    if (!conversation) {

      conversation = await Conversation.create({
        members: [req.user.id, userId]
      });

    }

    res.status(200).json(conversation);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* GET ALL CONVERSATIONS FOR LOGGED USER */
exports.getMyConversations = async (req, res) => {
  try {

    const conversations = await Conversation.find({
      members: req.user.id
    })
      .populate("members", "username")
      .sort({ updatedAt: -1 });

    res.json(conversations);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* GET SINGLE CONVERSATION */
exports.getConversation = async (req, res) => {
  try {

    const conversation = await Conversation.findById(req.params.id)
      .populate("members", "username");

    res.json(conversation);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};