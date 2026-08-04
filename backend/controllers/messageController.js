const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { createNotification } = require("./notificationController");

// @desc    Get or create a conversation with another user, then send first message optionally
// @route   POST /api/messages/start/:userId
// @access  Private
const startConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    if (otherUserId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, otherUserId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, otherUserId],
      });
    }

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for the logged-in user (inbox list)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name role profilePic companyName")
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized to view this conversation" });
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 });

    // mark messages sent by the other person as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/messages/:conversationId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized to message here" });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
    });

    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await message.populate("sender", "name profilePic");

    // notify the other participant(s)
    const recipientId = conversation.participants.find(
      (id) => id.toString() !== req.user._id.toString()
    );
    if (recipientId) {
      await createNotification({
        recipient: recipientId,
        sender: req.user._id,
        type: "message",
        text: `${req.user.name} sent you a message`,
      });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
};